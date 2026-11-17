import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { theme } from "./src/theme";

type RootStackParamList = {
  Central: undefined; Mapa: undefined; Cruzamentos: undefined;
  Analises: undefined; Ocorrencias: undefined; Perfil: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

function ScreenShell({ title, subtitle, children }: React.PropsWithChildren<{title:string;subtitle:string}>) {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>Move Sync / MOBILIDADE URBANA</Text>
    <Text style={styles.heading}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text>
    {children}
  </ScrollView></SafeAreaView>;
}
function Metric({label,value,detail}:{label:string;value:string;detail:string}) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{detail}</Text></View>;
}
function Central({navigation}:any) {
  const links:[string,keyof RootStackParamList][]=[["Mapa urbano","Mapa"],["Cruzamentos","Cruzamentos"],["Análises","Analises"],["Ocorrências","Ocorrencias"],["Meu perfil","Perfil"]];
  return <ScreenShell title="Sua cidade, em tempo real." subtitle="Visão geral da mobilidade • ambiente de demonstração">
    <View style={styles.status}><View style={styles.dot}/><Text style={styles.statusText}>MODO DEMONSTRAÇÃO ATIVO</Text></View>
    <View style={styles.metrics}><Metric label="FLUXO MONITORADO" value="1.284" detail="veículos / hora"/><Metric label="CRUZAMENTOS" value="08" detail="pontos na simulação"/></View>
    <View style={styles.panel}><Text style={styles.panelTitle}>ÍNDICE DE FLUIDEZ</Text><Text style={styles.bigNumber}>82<Text style={styles.unit}>/100</Text></Text><Text style={styles.muted}>Indicador ilustrativo para apresentação do produto.</Text><View style={styles.progress}><View style={styles.progressFill}/></View></View>
    <Text style={styles.section}>CENTRAL DE OPERAÇÕES</Text>
    {links.map(([label,route])=><Pressable key={route} style={styles.link} onPress={()=>navigation.navigate(route)}><Text style={styles.linkText}>{label}</Text><Text style={styles.arrow}>↗</Text></Pressable>)}
    <Text style={styles.foot}>Dados desta tela são simulados. Nenhum sensor real está conectado nesta versão.</Text>
  </ScreenShell>;
}
function MapScreen() {
  const crossings = [
    { id: "1", title: "Praça Mauá", latitude: -23.9352, longitude: -46.3331, level: "Moderado" },
    { id: "2", title: "Avenida Ana Costa", latitude: -23.9634, longitude: -46.3336, level: "Fluido" },
    { id: "3", title: "Avenida Conselheiro Nébias", latitude: -23.9514, longitude: -46.3298, level: "Intenso" }
  ];
  return <ScreenShell title="Mapa urbano" subtitle="Santos • mapa real com pontos ilustrativos">
    <View style={styles.mapFrame}>
      <MapView style={StyleSheet.absoluteFillObject}
        initialRegion={{latitude:-23.9535,longitude:-46.3336,latitudeDelta:0.055,longitudeDelta:0.055}}
        showsCompass showsScale>
        {crossings.map(point=><Marker key={point.id} coordinate={{latitude:point.latitude,longitude:point.longitude}} title={point.title} description={`Fluxo ${point.level} • dado demonstrativo`}/>)}
      </MapView>
    </View>
    <Text style={styles.foot}>O mapa utiliza cartografia real. Os pontos e indicadores são ilustrativos e não representam sensores conectados.</Text>
  </ScreenShell>;
}
function Generic({route}:any) {
  const copy:any={
    Mapa:["Mapa urbano","Visualização geográfica dos pontos de mobilidade."],
    Cruzamentos:["Cruzamentos inteligentes","Acompanhe o estado operacional de cada ponto monitorado."],
    Analises:["Análises de mobilidade","Indicadores e tendências para apoiar decisões."],
    Ocorrencias:["Ocorrências","Registre e acompanhe situações que afetam o trânsito."],
    Perfil:["Meu perfil","Preferências, conta e informações do aplicativo."]
  };
  const [title,subtitle]=copy[route.name] ?? ["Move Sync","Mobilidade inteligente"];
  return <ScreenShell title={title} subtitle={subtitle}><View style={styles.panel}><Text style={styles.panelTitle}>MÓDULO EM CONSTRUÇÃO</Text><Text style={styles.muted}>Esta área será conectada à API do Move Sync nas próximas etapas.</Text></View></ScreenShell>;
}
export default function App() {
  return <NavigationContainer theme={{...DarkTheme,colors:{...DarkTheme.colors,background:theme.colors.background,card:theme.colors.surface,text:theme.colors.text,border:theme.colors.border,primary:theme.colors.primary}}}>
    <StatusBar style="light"/><Stack.Navigator initialRouteName="Central" screenOptions={{headerStyle:{backgroundColor:theme.colors.background},headerTintColor:theme.colors.text,headerTitleStyle:{fontWeight:"700"}}}>
      <Stack.Screen name="Central" component={Central} options={{title:"Move Sync"}}/>
      <Stack.Screen name="Mapa" component={MapScreen}/><Stack.Screen name="Cruzamentos" component={Generic}/>
      <Stack.Screen name="Analises" component={Generic}/><Stack.Screen name="Ocorrencias" component={Generic}/>
      <Stack.Screen name="Perfil" component={Generic}/>
    </Stack.Navigator>
  </NavigationContainer>;
}
const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:theme.colors.background},content:{padding:22,paddingBottom:42},
 eyebrow:{color:theme.colors.primary,fontSize:10,fontWeight:"800",letterSpacing:2,marginBottom:14},
 heading:{color:theme.colors.text,fontSize:30,fontWeight:"800",letterSpacing:-1},
 subtitle:{color:theme.colors.muted,fontSize:13,lineHeight:20,marginTop:8,marginBottom:22},
 status:{flexDirection:"row",alignItems:"center",alignSelf:"flex-start",backgroundColor:theme.colors.primarySoft,paddingHorizontal:12,paddingVertical:9,borderRadius:20,marginBottom:16},
 dot:{width:7,height:7,borderRadius:4,backgroundColor:theme.colors.success,marginRight:8},statusText:{color:theme.colors.primary,fontSize:9,fontWeight:"800",letterSpacing:1},
 metrics:{flexDirection:"row",gap:12},metric:{flex:1,backgroundColor:theme.colors.surface,padding:15,borderRadius:16,borderWidth:1,borderColor:theme.colors.border},
 metricLabel:{color:theme.colors.muted,fontSize:9,fontWeight:"700",letterSpacing:1},metricValue:{color:theme.colors.text,fontSize:27,fontWeight:"800",marginVertical:8},muted:{color:theme.colors.muted,fontSize:11,lineHeight:17},
 panel:{backgroundColor:theme.colors.surface,padding:18,borderRadius:18,borderWidth:1,borderColor:theme.colors.border,marginTop:14},
 mapFrame:{height:420,borderRadius:18,overflow:"hidden",borderWidth:1,borderColor:theme.colors.border},
 panelTitle:{color:theme.colors.primary,fontSize:10,fontWeight:"800",letterSpacing:1.5},bigNumber:{color:theme.colors.text,fontSize:46,fontWeight:"800",marginVertical:8},unit:{color:theme.colors.muted,fontSize:16},
 progress:{height:6,backgroundColor:theme.colors.surfaceAlt,borderRadius:4,marginTop:16,overflow:"hidden"},progressFill:{height:6,width:"82%",backgroundColor:theme.colors.primary,borderRadius:4},
 section:{color:theme.colors.muted,fontSize:10,fontWeight:"800",letterSpacing:1.5,marginTop:26,marginBottom:10},
 link:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",padding:17,backgroundColor:theme.colors.surface,borderRadius:13,marginBottom:9,borderWidth:1,borderColor:theme.colors.border},
 linkText:{color:theme.colors.text,fontWeight:"600"},arrow:{color:theme.colors.primary,fontSize:18},foot:{color:theme.colors.muted,fontSize:10,lineHeight:16,marginTop:16}
});