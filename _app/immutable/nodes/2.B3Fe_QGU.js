import{s as Pe,r as qe,c as Ye,o as He,n as Fe,a as Se}from"../chunks/scheduler.CouYSk3Y.js";import{S as Ge,i as Je,e as _,l as w,s as q,c as p,a as S,m as T,d as f,b as Y,n as L,f as V,h as n,x as Ce,y as ce,o as H,t as se,k as ze,j as re,q as Ke,r as De,u as Oe,g as me,v as Ue,p as ye,w as Re}from"../chunks/index.xzp9WnH_.js";import{e as Ae}from"../chunks/each.D6YF6ztN.js";import{g as Le}from"../chunks/entry.D5UIe5C6.js";import{p as Qe}from"../chunks/stores.CmZBjDQs.js";import{B as $e}from"../chunks/BaseLink.Bgsqj-Qt.js";import{i as Me,d as Ve}from"../chunks/config.Bl6GI46O.js";function Be(t,e,l){const s=t.slice();return s[15]=e[l],s}function we(t){let e,l,s=t[2].split(" ").join(", ")+"",o;return{c(){e=w(`, matching
				`),l=_("em"),o=w(s)},l(a){e=T(a,`, matching
				`),l=p(a,"EM",{});var h=S(l);o=T(h,s),h.forEach(f)},m(a,h){V(a,e,h),V(a,l,h),n(l,o)},p(a,h){h&4&&s!==(s=a[2].split(" ").join(", ")+"")&&H(o,s)},d(a){a&&(f(e),f(l))}}}function Te(t){let e,l;return e=new $e({props:{href:"inscription/"+t[15].file,$$slots:{default:[We]},$$scope:{ctx:t}}}),{c(){De(e.$$.fragment)},l(s){Oe(e.$$.fragment,s)},m(s,o){Ue(e,s,o),l=!0},p(s,o){const a={};o&64&&(a.href="inscription/"+s[15].file),o&262208&&(a.$$scope={dirty:o,ctx:s}),e.$set(a)},i(s){l||(se(e.$$.fragment,s),l=!0)},o(s){re(e.$$.fragment,s),l=!1},d(s){Re(e,s)}}}function We(t){let e,l,s;return{c(){e=_("img"),this.h()},l(o){e=p(o,"IMG",{src:!0,alt:!0,loading:!0}),this.h()},h(){Se(e.src,l=Me+t[15].file+"/"+t[15].facsimile.url+"/full/400,/0/default.jpg")||L(e,"src",l),L(e,"alt",s=t[15].facsimile.desc),L(e,"loading","lazy")},m(o,a){V(o,e,a)},p(o,a){a&64&&!Se(e.src,l=Me+o[15].file+"/"+o[15].facsimile.url+"/full/400,/0/default.jpg")&&L(e,"src",l),a&64&&s!==(s=o[15].facsimile.desc)&&L(e,"alt",s)},d(o){o&&f(e)}}}function Xe(t){let e,l=t[15].title+"",s,o,a,h=t[15].file+"",B,v,c,I=t[15].status+"",d;return{c(){e=_("span"),s=w(l),o=q(),a=_("small"),B=w(h),v=q(),c=_("small"),d=w(I)},l(i){e=p(i,"SPAN",{});var m=S(e);s=T(m,l),m.forEach(f),o=Y(i),a=p(i,"SMALL",{});var U=S(a);B=T(U,h),U.forEach(f),v=Y(i),c=p(i,"SMALL",{});var D=S(c);d=T(D,I),D.forEach(f)},m(i,m){V(i,e,m),n(e,s),V(i,o,m),V(i,a,m),n(a,B),V(i,v,m),V(i,c,m),n(c,d)},p(i,m){m&64&&l!==(l=i[15].title+"")&&H(s,l),m&64&&h!==(h=i[15].file+"")&&H(B,h),m&64&&I!==(I=i[15].status+"")&&H(d,I)},d(i){i&&(f(e),f(o),f(a),f(v),f(c))}}}function Ie(t){var ne,oe;let e,l,s,o,a,h,B=t[15].notBefore!=null?t[15].notBefore<0?`${Math.abs(t[15].notBefore)} BC`:`AD ${t[15].notBefore}`:"Unknown",v,c,I=t[15].notAfter!=null?t[15].notAfter<0?`${Math.abs(t[15].notAfter)} BC`:`AD ${t[15].notAfter}`:"Unknown",d,i,m,U,D="Settlement",F,P=(t[15].settlement||"N/A")+"",N,M,b="Repository",G,J=(((ne=t[15].repository)==null?void 0:ne._)||"N/A")+"",Z,K,ee="Language",Q,W=(((oe=t[15].textLang)==null?void 0:oe._)||"N/A")+"",te,x,R,k=t[15].facsimile&&Te(t);return o=new $e({props:{href:"inscription/"+t[15].file,$$slots:{default:[Xe]},$$scope:{ctx:t}}}),{c(){e=_("li"),k&&k.c(),l=q(),s=_("p"),De(o.$$.fragment),a=q(),h=_("p"),v=w(B),c=w(" – "),d=w(I),i=q(),m=_("dl"),U=_("dt"),U.textContent=D,F=_("dd"),N=w(P),M=_("dt"),M.textContent=b,G=_("dd"),Z=w(J),K=_("dt"),K.textContent=ee,Q=_("dd"),te=w(W),x=q(),this.h()},l(u){e=p(u,"LI",{});var E=S(e);k&&k.l(E),l=Y(E),s=p(E,"P",{class:!0});var $=S(s);Oe(o.$$.fragment,$),$.forEach(f),a=Y(E),h=p(E,"P",{});var O=S(h);v=T(O,B),c=T(O," – "),d=T(O,I),O.forEach(f),i=Y(E),m=p(E,"DL",{});var j=S(m);U=p(j,"DT",{class:!0,"data-svelte-h":!0}),me(U)!=="svelte-upur71"&&(U.textContent=D),F=p(j,"DD",{});var ie=S(F);N=T(ie,P),ie.forEach(f),M=p(j,"DT",{class:!0,"data-svelte-h":!0}),me(M)!=="svelte-1uef0e6"&&(M.textContent=b),G=p(j,"DD",{});var z=S(G);Z=T(z,J),z.forEach(f),K=p(j,"DT",{class:!0,"data-svelte-h":!0}),me(K)!=="svelte-1aab11o"&&(K.textContent=ee),Q=p(j,"DD",{});var X=S(Q);te=T(X,W),X.forEach(f),j.forEach(f),x=Y(E),E.forEach(f),this.h()},h(){L(s,"class","title svelte-1fu2z0"),L(U,"class","svelte-1fu2z0"),L(M,"class","svelte-1fu2z0"),L(K,"class","svelte-1fu2z0")},m(u,E){V(u,e,E),k&&k.m(e,null),n(e,l),n(e,s),Ue(o,s,null),n(e,a),n(e,h),n(h,v),n(h,c),n(h,d),n(e,i),n(e,m),n(m,U),n(m,F),n(F,N),n(m,M),n(m,G),n(G,Z),n(m,K),n(m,Q),n(Q,te),n(e,x),R=!0},p(u,E){var O,j;u[15].facsimile?k?(k.p(u,E),E&64&&se(k,1)):(k=Te(u),k.c(),se(k,1),k.m(e,l)):k&&(ye(),re(k,1,1,()=>{k=null}),ze());const $={};E&64&&($.href="inscription/"+u[15].file),E&262208&&($.$$scope={dirty:E,ctx:u}),o.$set($),(!R||E&64)&&B!==(B=u[15].notBefore!=null?u[15].notBefore<0?`${Math.abs(u[15].notBefore)} BC`:`AD ${u[15].notBefore}`:"Unknown")&&H(v,B),(!R||E&64)&&I!==(I=u[15].notAfter!=null?u[15].notAfter<0?`${Math.abs(u[15].notAfter)} BC`:`AD ${u[15].notAfter}`:"Unknown")&&H(d,I),(!R||E&64)&&P!==(P=(u[15].settlement||"N/A")+"")&&H(N,P),(!R||E&64)&&J!==(J=(((O=u[15].repository)==null?void 0:O._)||"N/A")+"")&&H(Z,J),(!R||E&64)&&W!==(W=(((j=u[15].textLang)==null?void 0:j._)||"N/A")+"")&&H(te,W)},i(u){R||(se(k),se(o.$$.fragment,u),R=!0)},o(u){re(k),re(o.$$.fragment,u),R=!1},d(u){u&&f(e),k&&k.d(),Re(o)}}}function Ne(t){let e,l="Load More Inscriptions",s,o;return{c(){e=_("button"),e.textContent=l},l(a){e=p(a,"BUTTON",{"data-svelte-h":!0}),me(e)!=="svelte-1j8c85t"&&(e.textContent=l)},m(a,h){V(a,e,h),s||(o=ce(e,"click",t[9]),s=!0)},p:Fe,d(a){a&&f(e),s=!1,o()}}}function Ze(t){let e,l,s,o=Ve+"",a,h,B,v,c,I,d,i,m,U,D,F,P,N,M,b,G,J=t[0].length.toLocaleString()+"",Z,K,ee,Q=t[4].toLocaleString()+"",W,te,x,R=t[3].toLocaleString()+"",k,ne,oe,u,E,$,O,j,ie,z=t[2]&&t[1]&&we(t),X=Ae(t[6]),C=[];for(let r=0;r<X.length;r+=1)C[r]=Ie(Be(t,X,r));const je=r=>re(C[r],1,1,()=>{C[r]=null});let y=t[5]&&Ne(t);return{c(){e=_("article"),l=_("section"),s=_("h1"),a=w(o),h=q(),B=_("section"),v=_("form"),c=_("input"),I=q(),d=_("button"),i=w("Search"),U=q(),D=_("button"),F=w("Reset"),N=q(),M=_("section"),b=_("h2"),G=_("em"),Z=w(J),K=w(` Inscriptions over
			`),ee=_("em"),W=w(Q),te=w(`
			years across
			`),x=_("em"),k=w(R),ne=w(`
			locations`),z&&z.c(),oe=q(),u=_("ol");for(let r=0;r<C.length;r+=1)C[r].c();E=q(),$=_("section"),y&&y.c(),this.h()},l(r){e=p(r,"ARTICLE",{});var g=S(e);l=p(g,"SECTION",{class:!0});var A=S(l);s=p(A,"H1",{class:!0});var fe=S(s);a=T(fe,o),fe.forEach(f),A.forEach(f),h=Y(g),B=p(g,"SECTION",{class:!0});var pe=S(B);v=p(pe,"FORM",{class:!0});var ae=S(v);c=p(ae,"INPUT",{type:!0,name:!0,id:!0,placeholder:!0}),I=Y(ae),d=p(ae,"BUTTON",{type:!0});var he=S(d);i=T(he,"Search"),he.forEach(f),U=Y(ae),D=p(ae,"BUTTON",{type:!0});var de=S(D);F=T(de,"Reset"),de.forEach(f),ae.forEach(f),pe.forEach(f),N=Y(g),M=p(g,"SECTION",{class:!0});var ue=S(M);b=p(ue,"H2",{class:!0});var le=S(b);G=p(le,"EM",{});var ve=S(G);Z=T(ve,J),ve.forEach(f),K=T(le,` Inscriptions over
			`),ee=p(le,"EM",{});var ge=S(ee);W=T(ge,Q),ge.forEach(f),te=T(le,`
			years across
			`),x=p(le,"EM",{});var be=S(x);k=T(be,R),be.forEach(f),ne=T(le,`
			locations`),z&&z.l(le),le.forEach(f),oe=Y(ue),u=p(ue,"OL",{class:!0});var Ee=S(u);for(let _e=0;_e<C.length;_e+=1)C[_e].l(Ee);Ee.forEach(f),ue.forEach(f),E=Y(g),$=p(g,"SECTION",{class:!0});var ke=S($);y&&y.l(ke),ke.forEach(f),g.forEach(f),this.h()},h(){L(s,"class","svelte-1fu2z0"),L(l,"class","hero svelte-1fu2z0"),L(c,"type","text"),L(c,"name","keywords"),L(c,"id","keywords"),L(c,"placeholder","Search inscriptions metadata"),L(d,"type","submit"),d.value="Search",d.disabled=m=!t[2],L(D,"type","reset"),D.value="Reset",D.disabled=P=!t[2],L(v,"class","svelte-1fu2z0"),L(B,"class","svelte-1fu2z0"),L(b,"class","svelte-1fu2z0"),L(u,"class","svelte-1fu2z0"),L(M,"class","inscriptions svelte-1fu2z0"),L($,"class","svelte-1fu2z0")},m(r,g){V(r,e,g),n(e,l),n(l,s),n(s,a),n(e,h),n(e,B),n(B,v),n(v,c),Ce(c,t[2]),n(v,I),n(v,d),n(d,i),n(v,U),n(v,D),n(D,F),n(e,N),n(e,M),n(M,b),n(b,G),n(G,Z),n(b,K),n(b,ee),n(ee,W),n(b,te),n(b,x),n(x,k),n(b,ne),z&&z.m(b,null),n(M,oe),n(M,u);for(let A=0;A<C.length;A+=1)C[A]&&C[A].m(u,null);n(e,E),n(e,$),y&&y.m($,null),O=!0,j||(ie=[ce(c,"input",t[12]),ce(v,"submit",t[8]),ce(v,"reset",t[7])],j=!0)},p(r,[g]){if(g&4&&c.value!==r[2]&&Ce(c,r[2]),(!O||g&4&&m!==(m=!r[2]))&&(d.disabled=m),(!O||g&4&&P!==(P=!r[2]))&&(D.disabled=P),(!O||g&1)&&J!==(J=r[0].length.toLocaleString()+"")&&H(Z,J),(!O||g&16)&&Q!==(Q=r[4].toLocaleString()+"")&&H(W,Q),(!O||g&8)&&R!==(R=r[3].toLocaleString()+"")&&H(k,R),r[2]&&r[1]?z?z.p(r,g):(z=we(r),z.c(),z.m(b,null)):z&&(z.d(1),z=null),g&64){X=Ae(r[6]);let A;for(A=0;A<X.length;A+=1){const fe=Be(r,X,A);C[A]?(C[A].p(fe,g),se(C[A],1)):(C[A]=Ie(fe),C[A].c(),se(C[A],1),C[A].m(u,null))}for(ye(),A=X.length;A<C.length;A+=1)je(A);ze()}r[5]?y?y.p(r,g):(y=Ne(r),y.c(),y.m($,null)):y&&(y.d(1),y=null)},i(r){if(!O){for(let g=0;g<X.length;g+=1)se(C[g]);O=!0}},o(r){C=C.filter(Boolean);for(let g=0;g<C.length;g+=1)re(C[g]);O=!1},d(r){r&&f(e),z&&z.d(),Ke(C,r),y&&y.d(),j=!1,qe(ie)}}}function xe(t,e,l){let s,o,a,h,B;Ye(t,Qe,N=>l(14,B=N));let{data:v}=e,c=v.corpus,I=!1,d="",i=50,m=i;function U(){l(0,c=v.corpus),l(1,I=!1),l(2,d=""),Le(`?keywords=${encodeURIComponent(d)}`,{replaceState:!0}),l(11,i=50),m=i}function D(){if(Le(`?keywords=${encodeURIComponent(d)}`,{replaceState:!0}),l(1,I=!0),l(11,i=50),m=i,!d){l(0,c=v.corpus);return}l(0,c=v.corpus.filter(N=>d.split(" ").map(M=>M.toLowerCase()).every(M=>N.keywords.some(b=>b.includes(M)))))}function F(){l(11,i=Math.min(c.length,i+m))}He(()=>{l(2,d=B.url.searchParams.get("keywords")||""),d&&D()});function P(){d=this.value,l(2,d)}return t.$$set=N=>{"data"in N&&l(10,v=N.data)},t.$$.update=()=>{t.$$.dirty&2049&&l(6,s=c.slice(0,i)),t.$$.dirty&2049&&l(5,o=c.length>i),t.$$.dirty&1&&l(4,a=(()=>{const N=Math.min(...c.filter(b=>b.notBefore).map(b=>b.notBefore));return Math.max(...c.filter(b=>b.notAfter).map(b=>b.notAfter))-N})()),t.$$.dirty&1&&l(3,h=new Set(c.map(N=>N.settlement)).size)},[c,I,d,h,a,o,s,U,D,F,v,i,P]}class rt extends Ge{constructor(e){super(),Je(this,e,xe,Ze,Pe,{data:10})}}export{rt as component};