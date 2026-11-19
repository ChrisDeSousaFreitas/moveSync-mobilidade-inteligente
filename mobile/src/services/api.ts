import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
const API_URL=(process.env.EXPO_PUBLIC_API_URL||"http://10.0.2.2:8080/api").replace(/\/$/,"");
export type Usuario={id:number;nome:string;email:string};
export type Sessao={token:string;tipo:string;id:number;nome:string;email:string};
export type Ocorrencia={id:number;titulo:string;descricao:string;categoria:string;endereco?:string;latitude?:number;longitude?:number;status:"ABERTA"|"EM_ANALISE"|"RESOLVIDA";criadaEm:string};
export type OcorrenciaInput={titulo:string;descricao:string;categoria:string;endereco?:string;latitude?:number;longitude?:number;status:"ABERTA"|"EM_ANALISE"|"RESOLVIDA"};
const TOKEN_KEY="movesync.jwt",USER_KEY="movesync.usuario";
export async function salvarSessao(s:Sessao){await SecureStore.setItemAsync(TOKEN_KEY,s.token);await SecureStore.setItemAsync(USER_KEY,JSON.stringify({id:s.id,nome:s.nome,email:s.email}));}
export async function recuperarSessao():Promise<{token:string;usuario:Usuario}|null>{const [token,raw]=await Promise.all([SecureStore.getItemAsync(TOKEN_KEY),SecureStore.getItemAsync(USER_KEY)]);if(!token||!raw)return null;try{return{token,usuario:JSON.parse(raw) as Usuario};}catch{await limparSessao();return null;}}
export async function limparSessao(){await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY),SecureStore.deleteItemAsync(USER_KEY)]);}
async function requisicao<T>(rota:string,opcoes:RequestInit={},autenticada=true):Promise<T>{const token=autenticada?await SecureStore.getItemAsync(TOKEN_KEY):null;let resposta:Response;try{resposta=await fetch(`${API_URL}${rota}`,{...opcoes,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{}),...opcoes.headers}});}catch{throw new Error("Não foi possível conectar à API. Confira o servidor e o endereço configurado.");}if(!resposta.ok){let msg=`Falha na comunicação (HTTP ${resposta.status}).`;try{const corpo=await resposta.json();msg=corpo.erro||corpo.message||msg;}catch{}if(resposta.status===401&&autenticada){await limparSessao();throw new Error("Sua sessão expirou. Entre novamente.");}throw new Error(msg);}if(resposta.status===204)return undefined as T;return resposta.json() as Promise<T>;}
export const authApi={cadastrar:(nome:string,email:string,senha:string)=>requisicao<Sessao>("/auth/cadastro",{method:"POST",body:JSON.stringify({nome,email,senha})},false),entrar:(email:string,senha:string)=>requisicao<Sessao>("/auth/login",{method:"POST",body:JSON.stringify({email,senha})},false),sair:async()=>{try{await requisicao("/auth/logout",{method:"POST"});}finally{await limparSessao();}}};
async function chaveCacheOcorrencias():Promise<string>{
 const raw=await SecureStore.getItemAsync(USER_KEY);
 if(!raw)return "movesync.ocorrencias.anonimo";
 try{return `movesync.ocorrencias.${(JSON.parse(raw) as Usuario).id}`;}catch{return "movesync.ocorrencias.anonimo";}
}
async function lerCacheOcorrencias():Promise<Ocorrencia[]|null>{
 try{const raw=await AsyncStorage.getItem(await chaveCacheOcorrencias());return raw?JSON.parse(raw) as Ocorrencia[]:null;}catch{return null;}
}
async function gravarCacheOcorrencias(lista:Ocorrencia[]):Promise<void>{
 await AsyncStorage.setItem(await chaveCacheOcorrencias(),JSON.stringify(lista));
}
export const ocorrenciasApi={
 listar:async()=>{
  try{const lista=await requisicao<Ocorrencia[]>("/ocorrencias");await gravarCacheOcorrencias(lista);return lista;}
  catch(erro){const cache=await lerCacheOcorrencias();if(cache!==null)return cache;throw erro;}
 },
 consultar:async(id:number)=>{
  try{return await requisicao<Ocorrencia>(`/ocorrencias/${id}`);}
  catch(erro){const cache=await lerCacheOcorrencias();const item=cache?.find(x=>x.id===id);if(item)return item;throw erro;}
 },
 criar:async(dados:OcorrenciaInput)=>{
  const item=await requisicao<Ocorrencia>("/ocorrencias",{method:"POST",body:JSON.stringify(dados)});
  const cache=await lerCacheOcorrencias()||[];await gravarCacheOcorrencias([item,...cache.filter(x=>x.id!==item.id)]);return item;
 },
 atualizar:async(id:number,dados:OcorrenciaInput)=>{
  const item=await requisicao<Ocorrencia>(`/ocorrencias/${id}`,{method:"PUT",body:JSON.stringify(dados)});
  const cache=await lerCacheOcorrencias()||[];await gravarCacheOcorrencias(cache.map(x=>x.id===id?item:x));return item;
 },
 excluir:async(id:number)=>{
  await requisicao<void>(`/ocorrencias/${id}`,{method:"DELETE"});
  const cache=await lerCacheOcorrencias()||[];await gravarCacheOcorrencias(cache.filter(x=>x.id!==id));
 }
};
export type StatusApi={aplicacao:string;estado:string};
export const statusApi={consultar:()=>requisicao<StatusApi>("/status",{},false)};
