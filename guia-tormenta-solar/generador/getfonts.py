import re, urllib.request, os, hashlib
B="/tmp/claude-0/-home-user-CEPEGO/bec6475b-3c26-5745-860d-48e7f22a2ee0/scratchpad/build"
UA={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}
URL=("https://fonts.googleapis.com/css2?"
     "family=Archivo:wght@600;700;800&"
     "family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&"
     "family=JetBrains+Mono:wght@500;700&display=swap")
css=urllib.request.urlopen(urllib.request.Request(URL,headers=UA)).read().decode()
urls=sorted(set(re.findall(r"url\((https://[^)]+\.woff2)\)",css)))
print("faces woff2:",len(urls))
for u in urls:
    n=hashlib.md5(u.encode()).hexdigest()[:10]+".woff2"
    p=os.path.join(B,"fonts",n)
    if not os.path.exists(p):
        open(p,"wb").write(urllib.request.urlopen(urllib.request.Request(u,headers=UA)).read())
    css=css.replace(u,"fonts/"+n)
open(os.path.join(B,"fonts.css"),"w").write(css)
tot=sum(os.path.getsize(os.path.join(B,"fonts",f)) for f in os.listdir(os.path.join(B,"fonts")))
print(f"descargadas, {tot/1024:.0f} KB")
