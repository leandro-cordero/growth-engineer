var d=document,r=d.documentElement,m=d.cookie.match(/(?:^|; )fxr_aid=([^;]+)/),a=m&&m[1];
if(!a)try{a=crypto.randomUUID()}catch(e){a=Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)}
d.cookie="fxr_aid="+a+";max-age=31536000;path=/;SameSite=Lax"+(location.protocol=="https:"?";Secure":"");
r.dataset.returning=!!m;
E.forEach(function(e){for(var h=2166136261,s=e[0]+":"+a,i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);h^=h>>>16;h=Math.imul(h,2246822507);h^=h>>>13;h=Math.imul(h,3266489909);h^=h>>>16;r.setAttribute(e[0],e[1][Math.floor((h>>>0)/4294967296*e[1].length)])})
