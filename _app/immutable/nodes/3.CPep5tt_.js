import{d as N,a as i,t as f,e as Q,b as s}from"../chunks/disclose-version.DNuuheQc.js";import{y as V,A as W,D as a,B as e,F as X,g as r,G as R,z as x,C as t}from"../chunks/utils.DE1e-iYh.js";import{i as S}from"../chunks/props.MuTu1CGq.js";import{e as z,i as F,s as Y}from"../chunks/attributes.DEFeRuxD.js";import{B as U}from"../chunks/BaseLink.Cyzzm3PW.js";var Z=(P,o,j)=>o(P,r(j).nodes[0].target),$=f('<tr><td> </td><td> </td><td> </td><td><a href="#copy-target" class="copy-to-clipboard svelte-1kxbro4"> </a></td><td><a> </a></td></tr>'),tt=f('<h3><!> <small> </small></h3> <table class="svelte-1kxbro4"><thead><tr><th>ID</th><th>Impact</th><th>Description</th><th>Target</th><th>Help</th></tr></thead><tbody></tbody></table>',1),et=f('<section id="axe"><h2>Accessibility issues</h2> <!></section>'),at=f("<tr><td> </td><td> </td><td><!></td><td> </td></tr>"),rt=f('<section id="qa"><hgroup><h2>Build errors</h2> <h3><small> </small></h3></hgroup> <table class="svelte-1kxbro4"><thead><tr><th>Timestamp</th><th>Path</th><th>Referrer</th><th>Message</th></tr></thead><tbody></tbody></table></section>'),dt=f("<article><h1>QA</h1> <!> <!></article>");function vt(P,o){V(o,!0);function j(g,l){g.preventDefault,navigator.clipboard.writeText(`inspect($$("${l}")[0])`),alert("Copied to clipboard!")}var I=dt(),G=a(e(I),2);S(G,()=>Object.keys(o.data.axe).length>0,g=>{var l=et(),y=a(e(l),2);z(y,17,()=>Object.keys(o.data.axe),F,(D,v)=>{var A=tt(),n=X(A),k=e(n);U(k,{get href(){return r(v)},children:(T,d)=>{R();var h=Q();x(()=>s(h,r(v))),i(T,h)},$$slots:{default:!0}});var C=a(k,2),c=e(C);x(()=>s(c,`${o.data.axe[r(v)].length.toLocaleString()??""} accessibility issues found!`)),t(C),t(n);var u=a(n,2),b=a(e(u));z(b,21,()=>o.data.axe[r(v)],F,(T,d)=>{var h=$(),_=e(h),L=e(_,!0);t(_);var m=a(_),O=e(m,!0);t(m);var B=a(m),H=e(B,!0);t(B);var p=a(B),q=e(p);q.__click=[Z,j,d];var J=e(q,!0);t(q),t(p);var M=a(p),w=e(M),K=e(w,!0);t(w),t(M),t(h),x(()=>{s(L,r(d).id),s(O,r(d).impact),s(H,r(d).description),s(J,r(d).nodes[0].target),Y(w,"href",r(d).helpUrl),s(K,r(d).help)}),i(T,h)}),t(b),t(u),i(D,A)}),t(l),i(g,l)});var E=a(G,2);S(E,()=>o.data.prerender,g=>{var l=rt(),y=e(l),D=a(e(y),2),v=e(D),A=e(v);t(v),t(D),t(y);var n=a(y,2),k=a(e(n));z(k,21,()=>o.data.prerender,F,(C,c)=>{var u=at(),b=e(u),T=e(b,!0);t(b);var d=a(b),h=e(d,!0);t(d);var _=a(d),L=e(_);U(L,{get href(){return r(c).referrer},children:(B,H)=>{R();var p=Q();x(()=>s(p,r(c).referrer)),i(B,p)},$$slots:{default:!0}}),t(_);var m=a(_),O=e(m,!0);t(m),t(u),x(()=>{s(T,r(c).timestamp),s(h,r(c).path),s(O,r(c).message)}),i(C,u)}),t(k),t(n),t(l),x(()=>s(A,`${o.data.prerender.length??""} build errors found!`)),i(g,l)}),t(I),i(P,I),W()}N(["click"]);export{vt as component};