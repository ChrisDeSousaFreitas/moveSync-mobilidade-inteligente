import React, { createContext, useContext, useEffect, useState } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { theme } from "./src/theme";
import { authApi, ocorrenciasApi, limparSessao, recuperarSessao, salvarSessao, Ocorrencia, OcorrenciaInput, Sessao, Usuario, statusApi } from "./src/services/api";

type Rotas = { Acesso:undefined; Central:undefined; Mapa:undefined; Cruzamentos:undefined; Analises:undefined; Ocorrencias:undefined; DetalheOcorrencia:{id:number}; Perfil:undefined; Sobre:undefined };
const Stack=createNativeStackNavigator<Rotas>();
const AuthContext=createContext<{usuario:Usuario|null;encerrar:()=>Promise<void>;expirar:()=>Promise<void>}>({usuario:null,encerrar:async()=>{},expirar:async()=>{}});
const useAuth=()=>useContext(AuthContext);

function Shell({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){
 return <SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
  <Text style={styles.eyebrow}>MOVE SYNC / MOBILIDADE URBANA</Text><Text style={styles.heading}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>{children}
 </ScrollView></SafeAreaView>;
}
function Botao({label,onPress,outline=false,disabled=false}:{label:string;onPress:()=>void;outline?:boolean;disabled?:boolean}){
 return <Pressable disabled={disabled} onPress={onPress} style={[styles.button,outline&&styles.buttonOutline,disabled&&styles.disabled]}><Text style={[styles.buttonText,outline&&styles.buttonOutlineText]}>{label}</Text></Pressable>;
}
function Campo({label,value,onChangeText,placeholder,secureTextEntry=false,multiline=false,keyboardType}:{label:string;value:string;onChangeText:(v:string)=>void;placeholder?:string;secureTextEntry?:boolean;multiline?:boolean;keyboardType?:"default"|"email-address"}){
 return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder||label} placeholderTextColor={theme.colors.muted} secureTextEntry={secureTextEntry} multiline={multiline} keyboardType={keyboardType} autoCapitalize={keyboardType==="email-address"?"none":"sentences"} style={[styles.input,multiline&&styles.multiline]}/></View>;
}
function AuthScreen({onAuth}:{onAuth:(s:Sessao)=>void}){
 const [cadastro,setCadastro]=useState(false),[nome,setNome]=useState(""),[email,setEmail]=useState(""),[senha,setSenha]=useState(""),[busy,setBusy]=useState(false),[erro,setErro]=useState("");
 async function enviar(){setErro("");if(!email.trim()||!senha){setErro("Informe e-mail e senha.");return;}if(cadastro&&nome.trim().length<2){setErro("Informe seu nome.");return;}if(senha.length<8){setErro("A senha precisa ter pelo menos 8 caracteres.");return;}setBusy(true);try{const s=cadastro?await authApi.cadastrar(nome.trim(),email.trim(),senha):await authApi.entrar(email.trim(),senha);await salvarSessao(s);onAuth(s);}catch(e){setErro(e instanceof Error?e.message:"Não foi possível autenticar.");}finally{setBusy(false);}}
 return <Shell title="A cidade em movimento." subtitle="Acesse sua central de mobilidade urbana.">
  <View style={styles.brandMark}><Text style={styles.brandMarkText}>MS</Text></View><View style={styles.panel}><Text style={styles.panelTitle}>{cadastro?"CRIAR CONTA":"BEM-VINDO DE VOLTA"}</Text>
   {cadastro&&<Campo label="Nome" value={nome} onChangeText={setNome}/>}<Campo label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address"/><Campo label="Senha" value={senha} onChangeText={setSenha} secureTextEntry/>
   {!!erro&&<Text style={styles.error}>{erro}</Text>}<Botao label={busy?"AGUARDE...":cadastro?"CRIAR CONTA":"ENTRAR"} onPress={enviar} disabled={busy}/>
   <Botao label={cadastro?"Já tenho uma conta":"Criar uma conta"} onPress={()=>{setCadastro(!cadastro);setErro("");}} outline/>
  </View><Text style={styles.foot}>Sua conta protege suas ocorrências. Os dados são enviados à API do Move Sync.</Text>
 </Shell>;
}
function Central({navigation}:any){
 const [apiEstado,setApiEstado]=useState<"verificando"|"online"|"offline">("verificando");
 useEffect(()=>{statusApi.consultar().then(()=>setApiEstado("online")).catch(()=>setApiEstado("offline"));},[]);
 const links:[string,keyof Rotas][]=[["Mapa urbano","Mapa"],["Cruzamentos","Cruzamentos"],["Análises","Analises"],["Ocorrências","Ocorrencias"],["Meu perfil","Perfil"],["Sobre o app","Sobre"]];
 return <Shell title="Sua cidade, em movimento." subtitle="Visão geral da mobilidade • Santos/SP">
  <View style={styles.status}><View style={[styles.dot,apiEstado==="offline"&&{backgroundColor:theme.colors.danger},apiEstado==="verificando"&&{backgroundColor:theme.colors.warning}]}/><Text style={styles.statusText}>{apiEstado==="online"?"API CONECTADA":apiEstado==="offline"?"API INDISPONÍVEL":"VERIFICANDO API"}</Text></View><Text style={styles.foot}>PAINEL DE DEMONSTRAÇÃO · INDICADORES SIMULADOS</Text>
  <View style={styles.metrics}><View style={styles.metric}><Text style={styles.metricLabel}>FLUXO SIMULADO</Text><Text style={styles.metricValue}>1.284</Text><Text style={styles.muted}>veículos / hora*</Text></View><View style={styles.metric}><Text style={styles.metricLabel}>CRUZAMENTOS</Text><Text style={styles.metricValue}>03</Text><Text style={styles.muted}>pontos ilustrativos</Text></View></View>
  <View style={styles.panel}><Text style={styles.panelTitle}>ÍNDICE DE FLUIDEZ SIMULADO</Text><Text style={styles.bigNumber}>82<Text style={styles.unit}>/100</Text></Text><Text style={styles.muted}>Indicador demonstrativo, não representa medição real.</Text><View style={styles.progress}><View style={styles.progressFill}/></View></View>
  <Text style={styles.section}>CENTRAL DE OPERAÇÕES</Text>{links.map(([label,route])=><Pressable key={route} style={styles.link} onPress={()=>navigation.navigate(route)}><Text style={styles.linkText}>{label}</Text><Text style={styles.arrow}>↗</Text></Pressable>)}
  <Text style={styles.foot}>*Todos os números do painel são simulados. Nenhum sensor, câmera ou semáforo está conectado nesta versão.</Text>
 </Shell>;
}
function MapScreen(){
 const [mapReady,setMapReady]=useState(false);
 const points=[{id:"1",title:"Praça Mauá",latitude:-23.9352,longitude:-46.3331,level:"Moderado"},{id:"2",title:"Avenida Ana Costa",latitude:-23.9634,longitude:-46.3336,level:"Fluido"},{id:"3",title:"Avenida Conselheiro Nébias",latitude:-23.9514,longitude:-46.3298,level:"Intenso"}];
 return <Shell title="Mapa urbano" subtitle="Santos • cartografia real com pontos ilustrativos">
  <View style={styles.mapFrame}>
   <MapView
    provider={Platform.OS==="android"?PROVIDER_GOOGLE:undefined}
    style={StyleSheet.absoluteFillObject}
    initialRegion={{latitude:-23.9535,longitude:-46.3336,latitudeDelta:0.055,longitudeDelta:0.055}}
    onMapReady={()=>setMapReady(true)}
    loadingEnabled
    loadingBackgroundColor={theme.colors.surface}
    loadingIndicatorColor={theme.colors.primary}
    mapType="standard"
    showsCompass
    showsScale
    toolbarEnabled={false}
   >
    {points.map(p=><Marker key={p.id} coordinate={{latitude:p.latitude,longitude:p.longitude}} title={p.title} description={`Fluxo ${p.level} • demonstração`}/>)}
   </MapView>
   {!mapReady&&<View style={styles.mapLoading}><ActivityIndicator color={theme.colors.primary}/><Text style={styles.muted}>Carregando cartografia...</Text></View>}
  </View>
  <Text style={styles.foot}>O mapa utiliza cartografia real. Marcadores e indicadores são ilustrativos e não representam sensores conectados.</Text>
 </Shell>;
}
function Cruzamentos(){return <Shell title="Cruzamentos inteligentes" subtitle="Pontos de interesse na malha urbana de Santos"><View style={styles.panel}><Text style={styles.panelTitle}>PONTOS DE DEMONSTRAÇÃO</Text>{["Praça Mauá · fluxo moderado","Avenida Ana Costa · fluxo fluido","Avenida Conselheiro Nébias · fluxo intenso"].map(x=><Text key={x} style={styles.listItem}>{x}</Text>)}</View><Text style={styles.foot}>Estados operacionais ilustrativos. A integração com controladores semafóricos não está ativa.</Text></Shell>;}
function Analises(){return <Shell title="Análises de mobilidade" subtitle="Indicadores para apoiar decisões urbanas"><View style={styles.panel}><Text style={styles.panelTitle}>ÍNDICE DE FLUIDEZ</Text><Text style={styles.bigNumber}>82/100</Text><Text style={styles.muted}>Valor simulado para demonstração da interface.</Text></View><View style={styles.panel}><Text style={styles.panelTitle}>LEITURA DO CENÁRIO</Text><Text style={styles.listItem}>Fluxo geral: moderado</Text><Text style={styles.listItem}>Pontos no mapa: 03 (simulados)</Text><Text style={styles.listItem}>Atualização: dados demonstrativos</Text></View></Shell>;}
function Ocorrencias({navigation}:any){
 const {expirar}=useAuth();
 const [lista,setLista]=useState<Ocorrencia[]>([]),[titulo,setTitulo]=useState(""),[descricao,setDescricao]=useState(""),[categoria,setCategoria]=useState("CONGESTIONAMENTO"),[endereco,setEndereco]=useState(""),[status,setStatus]=useState<Ocorrencia["status"]>("ABERTA"),[editando,setEditando]=useState<number|null>(null),[busy,setBusy]=useState(false),[erro,setErro]=useState(""),[ok,setOk]=useState("");
 async function carregar(){setBusy(true);setErro("");try{setLista(await ocorrenciasApi.listar());}catch(e){setErro(e instanceof Error?e.message:"Falha ao carregar ocorrências.");if(e instanceof Error&&e.message.includes("sessão expirou"))await expirar();}finally{setBusy(false);}}
 useEffect(()=>{void carregar();},[]);
 function limpar(){setTitulo("");setDescricao("");setCategoria("CONGESTIONAMENTO");setEndereco("");setStatus("ABERTA");setEditando(null);}
 async function salvar(){setErro("");setOk("");if(titulo.trim().length<3||descricao.trim().length<5){setErro("Preencha título e descrição (mínimo 3 e 5 caracteres).");return;}setBusy(true);const dados:OcorrenciaInput={titulo:titulo.trim(),descricao:descricao.trim(),categoria:categoria.trim().toUpperCase().replace(/\s+/g,"_"),endereco:endereco.trim()||undefined,status};try{if(editando!==null){await ocorrenciasApi.atualizar(editando,dados);setOk("Ocorrência atualizada.");}else{await ocorrenciasApi.criar(dados);setOk("Ocorrência registrada.");}limpar();setLista(await ocorrenciasApi.listar());}catch(e){setErro(e instanceof Error?e.message:"Não foi possível salvar.");if(e instanceof Error&&e.message.includes("sessão expirou"))await expirar();}finally{setBusy(false);}}
 async function excluir(id:number){Alert.alert("Excluir ocorrência","Esta ação não pode ser desfeita.",[{text:"Cancelar",style:"cancel"},{text:"Excluir",style:"destructive",onPress:async()=>{try{await ocorrenciasApi.excluir(id);setLista(v=>v.filter(x=>x.id!==id));setOk("Ocorrência excluída.");}catch(e){setErro(e instanceof Error?e.message:"Falha ao excluir.");if(e instanceof Error&&e.message.includes("sessão expirou"))await expirar();}}}]);}
 return <Shell title="Ocorrências" subtitle="Registre e acompanhe situações no trânsito.">
  <View style={styles.panel}><Text style={styles.panelTitle}>{editando===null?"NOVA OCORRÊNCIA":"EDITAR OCORRÊNCIA"}</Text><Campo label="Título" value={titulo} onChangeText={setTitulo} placeholder="Ex.: Acidente na via"/><Campo label="Descrição" value={descricao} onChangeText={setDescricao} multiline placeholder="Descreva o que aconteceu"/><Campo label="Categoria" value={categoria} onChangeText={setCategoria} placeholder="CONGESTIONAMENTO"/><Campo label="Endereço (opcional)" value={endereco} onChangeText={setEndereco}/><View style={styles.fieldWrap}><Text style={styles.fieldLabel}>STATUS</Text><View style={styles.statusOptions}>{(["ABERTA","EM_ANALISE","RESOLVIDA"] as const).map(opcao=><Pressable key={opcao} onPress={()=>setStatus(opcao)} style={[styles.statusOption,status===opcao&&styles.statusOptionActive]}><Text style={[styles.statusOptionText,status===opcao&&styles.statusOptionTextActive]}>{opcao.replace("_"," ")}</Text></Pressable>)}</View></View>{!!erro&&<Text style={styles.error}>{erro}</Text>}{!!ok&&<Text style={styles.success}>{ok}</Text>}<Botao label={busy?"SALVANDO...":editando===null?"REGISTRAR OCORRÊNCIA":"SALVAR ALTERAÇÕES"} onPress={salvar} disabled={busy}/>{editando!==null&&<Botao label="Cancelar edição" onPress={limpar} outline/>}</View>
  <View style={styles.rowBetween}><Text style={styles.section}>MINHAS OCORRÊNCIAS</Text><Pressable onPress={()=>void carregar()}><Text style={styles.refresh}>ATUALIZAR ↻</Text></Pressable></View>
  {busy&&lista.length===0?<ActivityIndicator color={theme.colors.primary}/>:lista.length===0?<View style={styles.panel}><Text style={styles.muted}>Nenhuma ocorrência cadastrada ainda.</Text></View>:lista.map(item=><View key={item.id} style={styles.panel}><Text style={styles.panelTitle}>{item.categoria} · {item.status}</Text><Text style={styles.listTitle}>{item.titulo}</Text><Text style={styles.muted}>{item.descricao}</Text>{!!item.endereco&&<Text style={styles.muted}>{item.endereco}</Text>}<View style={styles.actions}><Pressable onPress={()=>navigation.navigate("DetalheOcorrencia",{id:item.id})}><Text style={styles.refresh}>CONSULTAR</Text></Pressable><Pressable onPress={()=>{setEditando(item.id);setTitulo(item.titulo);setDescricao(item.descricao);setCategoria(item.categoria);setEndereco(item.endereco||"");setStatus(item.status);}}><Text style={styles.refresh}>EDITAR</Text></Pressable><Pressable onPress={()=>void excluir(item.id)}><Text style={styles.delete}>EXCLUIR</Text></Pressable></View></View>)}
 </Shell>;
}
function DetalheOcorrencia({route}:any){
 const id=Number(route.params?.id);
 const [item,setItem]=useState<Ocorrencia|null>(null),[busy,setBusy]=useState(true),[erro,setErro]=useState("");
 useEffect(()=>{let ativo=true;ocorrenciasApi.consultar(id).then(v=>{if(ativo)setItem(v);}).catch(e=>{if(ativo)setErro(e instanceof Error?e.message:"Não foi possível consultar o registro.");}).finally(()=>{if(ativo)setBusy(false);});return()=>{ativo=false;};},[id]);
 return <Shell title="Detalhe da ocorrência" subtitle={`Consulta do registro #${id}`}>
  {busy?<ActivityIndicator color={theme.colors.primary}/>:erro?<Text style={styles.error}>{erro}</Text>:item?<View style={styles.panel}>
   <Text style={styles.panelTitle}>{item.categoria} · {item.status.replace("_"," ")}</Text>
   <Text style={styles.listTitle}>{item.titulo}</Text>
   <Text style={styles.section}>DESCRIÇÃO</Text><Text style={styles.muted}>{item.descricao}</Text>
   <Text style={styles.section}>ENDEREÇO</Text><Text style={styles.muted}>{item.endereco||"Não informado"}</Text>
   <Text style={styles.section}>DATA DE REGISTRO</Text><Text style={styles.muted}>{item.criadaEm?new Date(item.criadaEm).toLocaleString("pt-BR"):"Não informada"}</Text>
  </View>:null}
 </Shell>;
}
function Perfil(){const {usuario,encerrar}=useAuth();return <Shell title="Meu perfil" subtitle="Sua conta no Move Sync"><View style={styles.panel}><Text style={styles.panelTitle}>CONTA AUTENTICADA</Text><Text style={styles.listTitle}>{usuario?.nome}</Text><Text style={styles.muted}>{usuario?.email}</Text><Botao label="SAIR DA CONTA" onPress={()=>void encerrar()} outline/></View></Shell>;}
function Sobre(){return <Shell title="Sobre o Move Sync" subtitle="Mobilidade urbana inteligente"><View style={styles.panel}><Text style={styles.panelTitle}>MOVE SYNC</Text><Text style={styles.listTitle}>Mobilidade conectada. Cidade mais fluida.</Text><Text style={styles.muted}>Aplicativo acadêmico de demonstração para visualização de mobilidade urbana e registro colaborativo de ocorrências.</Text><Text style={styles.section}>VERSÃO 1.0.0 · EM DESENVOLVIMENTO</Text><Text style={styles.muted}>Commit de referência: ea479c7b610e0b1434a518e39d9aef330f1cf9e7</Text></View></Shell>;}
export default function App(){
 const [sessao,setSessao]=useState<{token:string;usuario:Usuario}|null>(null),[iniciando,setIniciando]=useState(true);
 useEffect(()=>{recuperarSessao().then(setSessao).catch(()=>setSessao(null)).finally(()=>setIniciando(false));},[]);
 async function encerrar(){try{await authApi.sair();}catch{await limparSessao();}setSessao(null);}async function expirar(){await limparSessao();setSessao(null);}
 const navTheme={...DarkTheme,colors:{...DarkTheme.colors,background:theme.colors.background,card:theme.colors.surface,text:theme.colors.text,border:theme.colors.border,primary:theme.colors.primary}};
 if(iniciando)return <View style={styles.loading}><ActivityIndicator color={theme.colors.primary} size="large"/><Text style={styles.muted}>Preparando o Move Sync...</Text></View>;
 return <AuthContext.Provider value={{usuario:sessao?.usuario||null,encerrar,expirar}}><NavigationContainer theme={navTheme}><StatusBar style="light"/><Stack.Navigator screenOptions={{headerStyle:{backgroundColor:theme.colors.background},headerTintColor:theme.colors.text,headerTitleStyle:{fontWeight:"700"},contentStyle:{backgroundColor:theme.colors.background}}}>
 {sessao===null?<Stack.Screen name="Acesso" options={{headerShown:false}}>{()=><AuthScreen onAuth={s=>setSessao({token:s.token,usuario:{id:s.id,nome:s.nome,email:s.email}})}/>}</Stack.Screen>:<>
 <Stack.Screen name="Central" component={Central} options={{title:"Move Sync"}}/><Stack.Screen name="Mapa" component={MapScreen}/><Stack.Screen name="Cruzamentos" component={Cruzamentos}/><Stack.Screen name="Analises" component={Analises}/><Stack.Screen name="Ocorrencias" component={Ocorrencias}/><Stack.Screen name="DetalheOcorrencia" component={DetalheOcorrencia} options={{title:"Consultar ocorrência"}}/><Stack.Screen name="Perfil" component={Perfil}/><Stack.Screen name="Sobre" component={Sobre}/>
 </>}
 </Stack.Navigator></NavigationContainer></AuthContext.Provider>;
}
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:theme.colors.background},content:{padding:22,paddingBottom:44},loading:{flex:1,backgroundColor:theme.colors.background,alignItems:"center",justifyContent:"center",gap:14},
 eyebrow:{color:theme.colors.primary,fontSize:10,fontWeight:"800",letterSpacing:2,marginBottom:14},heading:{color:theme.colors.text,fontSize:30,fontWeight:"800",letterSpacing:-1},subtitle:{color:theme.colors.muted,fontSize:13,lineHeight:20,marginTop:8,marginBottom:22},
 status:{flexDirection:"row",alignItems:"center",alignSelf:"flex-start",backgroundColor:theme.colors.primarySoft,paddingHorizontal:12,paddingVertical:9,borderRadius:20,marginBottom:16},dot:{width:7,height:7,borderRadius:4,backgroundColor:theme.colors.success,marginRight:8},statusText:{color:theme.colors.primary,fontSize:9,fontWeight:"800",letterSpacing:1},
 metrics:{flexDirection:"row",gap:12},metric:{flex:1,backgroundColor:theme.colors.surface,padding:15,borderRadius:16,borderWidth:1,borderColor:theme.colors.border},metricLabel:{color:theme.colors.muted,fontSize:9,fontWeight:"700",letterSpacing:1},metricValue:{color:theme.colors.text,fontSize:27,fontWeight:"800",marginVertical:8},muted:{color:theme.colors.muted,fontSize:11,lineHeight:17},
 panel:{backgroundColor:theme.colors.surface,padding:18,borderRadius:18,borderWidth:1,borderColor:theme.colors.border,marginTop:14},panelTitle:{color:theme.colors.primary,fontSize:10,fontWeight:"800",letterSpacing:1.5},bigNumber:{color:theme.colors.text,fontSize:46,fontWeight:"800",marginVertical:8},unit:{color:theme.colors.muted,fontSize:16},progress:{height:6,backgroundColor:theme.colors.surfaceAlt,borderRadius:4,marginTop:16,overflow:"hidden"},progressFill:{height:6,width:"82%",backgroundColor:theme.colors.primary,borderRadius:4},
 section:{color:theme.colors.muted,fontSize:10,fontWeight:"800",letterSpacing:1.5,marginTop:26,marginBottom:10},link:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",padding:17,backgroundColor:theme.colors.surface,borderRadius:13,marginBottom:9,borderWidth:1,borderColor:theme.colors.border},linkText:{color:theme.colors.text,fontWeight:"600"},arrow:{color:theme.colors.primary,fontSize:18},foot:{color:theme.colors.muted,fontSize:10,lineHeight:16,marginTop:16},
 mapFrame:{height:420,borderRadius:18,overflow:"hidden",borderWidth:1,borderColor:theme.colors.border},mapLoading:{...StyleSheet.absoluteFillObject,alignItems:"center",justifyContent:"center",gap:10,backgroundColor:theme.colors.surface},brandMark:{width:58,height:58,borderRadius:18,backgroundColor:theme.colors.primarySoft,alignItems:"center",justifyContent:"center",marginBottom:8},brandMarkText:{color:theme.colors.primary,fontSize:20,fontWeight:"900"},
 fieldWrap:{marginTop:14},statusOptions:{flexDirection:"row",flexWrap:"wrap",gap:7},statusOption:{paddingHorizontal:10,paddingVertical:9,borderRadius:10,borderWidth:1,borderColor:theme.colors.border,backgroundColor:theme.colors.background},statusOptionActive:{borderColor:theme.colors.primary,backgroundColor:theme.colors.primarySoft},statusOptionText:{color:theme.colors.muted,fontSize:9,fontWeight:"700"},statusOptionTextActive:{color:theme.colors.primary},fieldLabel:{color:theme.colors.muted,fontSize:10,fontWeight:"800",letterSpacing:1,marginBottom:7},input:{backgroundColor:theme.colors.background,borderWidth:1,borderColor:theme.colors.border,borderRadius:12,color:theme.colors.text,paddingHorizontal:13,paddingVertical:12,fontSize:14},multiline:{minHeight:88,textAlignVertical:"top"},
 button:{backgroundColor:theme.colors.primary,padding:15,borderRadius:12,alignItems:"center",marginTop:14},buttonText:{color:"#06131D",fontSize:11,fontWeight:"900",letterSpacing:1},buttonOutline:{backgroundColor:"transparent",borderWidth:1,borderColor:theme.colors.border},buttonOutlineText:{color:theme.colors.text},disabled:{opacity:0.55},
 error:{color:theme.colors.danger,fontSize:12,marginTop:12},success:{color:theme.colors.success,fontSize:12,marginTop:12},listItem:{color:theme.colors.text,fontSize:13,paddingVertical:10,borderBottomWidth:1,borderBottomColor:theme.colors.border},listTitle:{color:theme.colors.text,fontSize:16,fontWeight:"700",marginTop:12,marginBottom:6},rowBetween:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},refresh:{color:theme.colors.primary,fontSize:10,fontWeight:"900",letterSpacing:1},actions:{flexDirection:"row",justifyContent:"flex-end",gap:22,marginTop:16},delete:{color:theme.colors.danger,fontSize:10,fontWeight:"900",letterSpacing:1}
});
