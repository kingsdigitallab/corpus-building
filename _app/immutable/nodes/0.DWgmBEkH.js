import{w as ie,o as A,a as h,x as Q,t as S,y as ce,e as C,b as J,s as le,c as de}from"../chunks/disclose-version.DNuuheQc.js";import{b as fe,h as G,c as ue,x as ve,p as he,a as me,d as pe,ah as _e,E as ge,aR as $e,aS as be,o as ye,n as ke,W as R,at as we,q as Te,t as k,aT as Ee,az as U,an as D,a4 as xe,F as E,ay as Ae,s as I,g as w,D as T,B as g,C as $,y as V,A as X,z as N,G as F,K as z,aU as H}from"../chunks/utils.DE1e-iYh.js";import{l as Y,s as ee,a as K,i as B,p as Se}from"../chunks/props.MuTu1CGq.js";import{B as j,s as te}from"../chunks/BaseLink.Cyzzm3PW.js";import{s as qe}from"../chunks/attributes.DEFeRuxD.js";import{p as Ie}from"../chunks/stores.Bw9kSrjb.js";import{s as ae,t as P}from"../chunks/config.C11SEYnn.js";import{c as Ne}from"../chunks/svelte-component.CHsbUmyc.js";import"../chunks/legacy.CvZse-fJ.js";import{I as re,B as Pe}from"../chunks/Icon.ByIy3C-v.js";function Me(t,e,n){G&&ue();var a=t,r=_e,o;fe(()=>{ve(r,r=e())&&(o&&he(o),o=me(()=>n(a)))}),G&&(a=pe)}const Ce=()=>performance.now(),y={tick:t=>requestAnimationFrame(t),now:()=>Ce(),tasks:new Set};function se(t){y.tasks.forEach(e=>{e.c(t)||(y.tasks.delete(e),e.f())}),y.tasks.size!==0&&y.tick(se)}function Fe(t){let e;return y.tasks.size===0&&y.tick(se),{promise:new Promise(n=>{y.tasks.add(e={c:t,f:n})}),abort(){y.tasks.delete(e)}}}function W(t,e){t.dispatchEvent(new CustomEvent(e))}function ze(t){if(t==="float")return"cssFloat";if(t==="offset")return"cssOffset";if(t.startsWith("--"))return t;const e=t.split("-");return e.length===1?e[0]:e[0]+e.slice(1).map(n=>n[0].toUpperCase()+n.slice(1)).join("")}function Z(t){const e={},n=t.split(";");for(const a of n){const[r,o]=a.split(":");if(!r||o===void 0)break;const s=ze(r.trim());e[s]=o.trim()}return e}const je=t=>t;function Be(t,e,n,a){var r=(t&Ee)!==0,o="in",s,c=e.inert,i,u;function m(){var f=xe,b=R;U(null),D(null);try{return s??(s=n()(e,(a==null?void 0:a())??{},{direction:o}))}finally{U(f),D(b)}}var v={is_global:r,in(){e.inert=c,i==null||i.abort(),W(e,"introstart"),i=oe(e,m(),u,1,()=>{W(e,"introend"),i==null||i.abort(),i=s=void 0})},out(f){{f==null||f(),s=void 0;return}},stop:()=>{i==null||i.abort()}},d=R;if((d.transitions??(d.transitions=[])).push(v),ie){var p=r;if(!p){for(var l=d.parent;l&&l.f&ge;)for(;(l=l.parent)&&!(l.f&$e););p=!l||(l.f&be)!==0}p&&ye(()=>{ke(()=>v.in())})}}function oe(t,e,n,a,r){if(we(e)){var o,s=!1;return Te(()=>{if(!s){var f=e({direction:"in"});o=oe(t,f,n,a,r)}}),{abort:()=>{s=!0,o==null||o.abort()},deactivate:()=>o.deactivate(),reset:()=>o.reset(),t:()=>o.t()}}if(!(e!=null&&e.duration))return r(),{abort:k,deactivate:k,reset:k,t:()=>a};const{delay:c=0,css:i,tick:u,easing:m=je}=e;var v=[];if(u&&u(0,1),i){var d=Z(i(0,1));v.push(d,d)}var p=()=>1-a,l=t.animate(v,{duration:c});return l.onfinish=()=>{var f=1-a,b=a-f,_=e.duration*Math.abs(b),x=[];if(_>0){if(i)for(var L=Math.ceil(_/16.666666666666668),M=0;M<=L;M+=1){var O=f+b*m(M/L),ne=i(O,1-O);x.push(Z(ne))}p=()=>{var q=l.currentTime;return f+b*m(q/_)},u&&Fe(()=>{if(l.playState!=="running")return!1;var q=p();return u(q,1-q),!0})}l=t.animate(x,{duration:_,fill:"forwards"}),l.onfinish=()=>{p=()=>a,u==null||u(a,1-a),r()}},{abort:()=>{l&&(l.cancel(),l.effect=null,l.onfinish=k)},deactivate:()=>{r=k},reset:()=>{},t:()=>p()}}const Le=!0;async function Oe({data:t,url:e}){return{...t,url:e.pathname}}const dt=Object.freeze(Object.defineProperty({__proto__:null,load:Oe,prerender:Le},Symbol.toStringTag,{value:"Module"}));function Ge(t,e){const n=Y(e,["children","$$slots","$$events","$$legacy"]);re(t,ee({name:"moon"},()=>n,{iconNode:[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"}]],children:(r,o)=>{var s=A(),c=E(s);ae(c,e,"default",{},null),h(r,s)},$$slots:{default:!0}}))}function Re(t,e){const n=Y(e,["children","$$slots","$$events","$$legacy"]);re(t,ee({name:"sun"},()=>n,{iconNode:[["circle",{cx:"12",cy:"12",r:"4"}],["path",{d:"M12 2v2"}],["path",{d:"M12 20v2"}],["path",{d:"m4.93 4.93 1.41 1.41"}],["path",{d:"m17.66 17.66 1.41 1.41"}],["path",{d:"M2 12h2"}],["path",{d:"M20 12h2"}],["path",{d:"m6.34 17.66-1.41 1.41"}],["path",{d:"m19.07 4.93-1.41 1.41"}]],children:(r,o)=>{var s=A(),c=E(s);ae(c,e,"default",{},null),h(r,s)},$$slots:{default:!0}}))}var Ue=ce(`<script type="module">
		let theme = localStorage.getItem('color-scheme') || 'light';
		const preference = window.matchMedia('(prefers-color-scheme: dark)');

		if (preference.matches) {
			theme = 'dark';
		}

		document.documentElement.setAttribute('color-scheme', theme);
		localStorage.setItem('color-scheme', theme);
	<\/script><!---->`,1),De=S('<div class="theme-toggle svelte-135zs5i"><!></div>');function He(t){let e=Ae(K(localStorage.getItem("color-scheme")||"light"));{const s=window.matchMedia("(prefers-color-scheme: dark)");s.matches&&I(e,"dark"),n(),s.addEventListener("change",c=>{c.matches?I(e,"dark"):I(e,"light"),n()})}function n(){document.documentElement.setAttribute("color-scheme",w(e)),localStorage.setItem("color-scheme",w(e))}function a(){I(e,K(w(e)==="light"?"dark":"light")),n()}var r=De();Q(s=>{var c=Ue(),i=T(E(c));h(s,c)});var o=g(r);Ne(o,()=>Pe,(s,c)=>{c(s,{onclick:a,"aria-label":"Toggle colour scheme",children:(i,u)=>{var m=A(),v=E(m);B(v,()=>w(e)==="light",d=>{Ge(d,{})},d=>{Re(d,{})}),h(i,m)},$$slots:{default:!0}})}),$(r),h(t,r)}var Ke=S('<li class="svelte-qw7dfi"><!></li>'),We=S('<header><nav class="svelte-qw7dfi"><!> <ul class="svelte-qw7dfi"><li class="svelte-qw7dfi">About</li> <li class="svelte-qw7dfi">Guide</li> <!> <li class="svelte-qw7dfi"><!></li></ul></nav></header>');function Ze(t,e){V(e,!0);let n=Se(e,"debug",3,!1);var a=We(),r=g(a),o=g(r);j(o,{href:"/",class:"title",children:(m,v)=>{F();var d=C();N(()=>J(d,P)),h(m,d)},$$slots:{default:!0}});var s=T(o,2),c=T(g(s),4);B(c,n,m=>{var v=Ke(),d=g(v);j(d,{href:"/_qa",children:(p,l)=>{F();var f=C("QA");h(p,f)},$$slots:{default:!0}}),$(v),h(m,v)});var i=T(c,2),u=g(i);He(u),$(i),$(s),$(r),$(a),h(t,a),X()}const Qe=t=>t;function Je(t,{delay:e=0,duration:n=400,easing:a=Qe}={}){const r=+getComputedStyle(t).opacity;return{delay:e,duration:n,easing:a,css:o=>`opacity: ${o*r}`}}var Ve=S('<div class="svelte-1qe6l86"><!></div>');function Xe(t,e){const n=z(()=>e.children);var a=A(),r=E(a);Me(r,()=>e.url,o=>{var s=Ve(),c=g(s);te(c,()=>w(n)??k),$(s),Be(1,s,()=>Je,()=>({duration:500})),h(o,s)}),h(t,a)}var Ye=S('<div class="layout svelte-1j848h4"><!> <main class="svelte-1j848h4"><!></main> <footer class="svelte-1j848h4"><!> <code class="version svelte-1j848h4"><a></a></code></footer></div>');function ft(t,e){V(e,!0);const n=le(),a=()=>de(Ie,"$page",n),r="0.9.0";let o=z(()=>e.data.url);const s=z(()=>e.children);var c=Ye();Q(f=>{var b=A(),_=E(b);B(_,()=>a().data.title,x=>{N(()=>H.title=`${P??""} | ${a().data.title??""}`)},x=>{N(()=>H.title=P)}),h(f,b)});var i=g(c);Ze(i,{get debug(){return e.data.debug}});var u=T(i,2),m=g(u);Xe(m,{get url(){return w(o)},children:(f,b)=>{var _=A(),x=E(_);te(x,()=>w(s)??k),h(f,_)},$$slots:{default:!0}}),$(u);var v=T(u,2),d=g(v);j(d,{href:"/",children:(f,b)=>{F();var _=C();N(()=>J(_,P)),h(f,_)},$$slots:{default:!0}});var p=T(d,2),l=g(p);qe(l,"href",`https://github.com/kingsdigitallab/corpus-building/blob/v${r}/CHANGELOG.md`),l.textContent=`v${r}`,$(p),$(v),$(c),h(t,c),X()}export{ft as component,dt as universal};