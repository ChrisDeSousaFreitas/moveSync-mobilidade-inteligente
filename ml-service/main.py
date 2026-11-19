from pathlib import Path
import io, joblib, pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
app=FastAPI(title="MoveSync ML",version="1.0.0")
MODEL=Path("models/isolation-forest.joblib")
bundle=None
REQUIRED={"ano","mes","acidentes","vitimas_fatais"}
@app.get("/health")
def health(): return {"status":"online","trained":MODEL.exists()}
@app.post("/train")
async def train(file:UploadFile=File(...)):
 global bundle
 if not file.filename or not file.filename.lower().endswith(".csv"): raise HTTPException(400,"Envie CSV.")
 try:
  df=pd.read_csv(io.BytesIO(await file.read()))
  missing=REQUIRED-set(df.columns)
  if missing: raise HTTPException(422,"Colunas ausentes: "+", ".join(sorted(missing)))
  df=df[list(REQUIRED)].apply(pd.to_numeric,errors="coerce").dropna()
  df=df[(df.mes.between(1,12))&(df.ano>2000)&(df.acidentes>=0)&(df.vitimas_fatais>=0)]
  if len(df)<30: raise HTTPException(422,"São necessárias pelo menos 30 linhas válidas.")
  scaler=StandardScaler(); x=scaler.fit_transform(df[["ano","mes","acidentes","vitimas_fatais"]])
  model=IsolationForest(contamination="auto",random_state=42).fit(x)
  bundle={"model":model,"scaler":scaler,"rows":len(df),"source":file.filename}
  MODEL.parent.mkdir(exist_ok=True);joblib.dump(bundle,MODEL)
  return {"status":"trained","records":len(df),"source_file":file.filename,"method":"Isolation Forest","limitation":"Padrões atípicos históricos; não prevê acidentes."}
 except HTTPException: raise
 except Exception as e: raise HTTPException(400,"CSV inválido: "+str(e))
@app.get("/analysis")
def analysis():
 global bundle
 if bundle is None and MODEL.exists(): bundle=joblib.load(MODEL)
 if bundle is None:return {"status":"sem_dados","message":"Modelo não treinado. Importe CSV público normalizado.","results":{},"source":"nenhuma base importada"}
 return {"status":"treinado","message":"Modelo treinado com dados agregados.","results":{"registros":bundle["rows"],"metodo":"Isolation Forest","limite":"Detecção exploratória, não previsão."},"source":bundle["source"]}
