import{o as l,h as v,A}from"./runtime.BQotSvAO.js";import{s as m}from"./utils.B5sIsHFd.js";const a=[];function k(s,t){return{subscribe:x(s,t).subscribe}}function x(s,t=l){let n=null;const o=new Set;function u(r){if(A(s,r)&&(s=r,n)){const i=!a.length;for(const e of o)e[1](),a.push(e,s);if(i){for(let e=0;e<a.length;e+=2)a[e][0](a[e+1]);a.length=0}}}function b(r){u(r(s))}function f(r,i=l){const e=[r,i];return o.add(e),o.size===1&&(n=t(u,b)||l),r(s),()=>{o.delete(e),o.size===0&&n&&(n(),n=null)}}return{set:u,update:b,subscribe:f}}function E(s,t,n){const o=!Array.isArray(s),u=o?[s]:s;if(!u.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const b=t.length<2;return k(n,(f,r)=>{let i=!1;const e=[];let d=0,p=l;const g=()=>{if(d)return;p();const c=t(o?e[0]:e,f,r);b?f(c):p=typeof c=="function"?c:l},w=u.map((c,_)=>m(c,q=>{e[_]=q,d&=~(1<<_),i&&g()},()=>{d|=1<<_}));return i=!0,g(),function(){v(w),p(),i=!1}})}function S(s){return{subscribe:s.subscribe.bind(s)}}function j(s){let t;return m(s,n=>t=n)(),t}var h;const z=((h=globalThis.__sveltekit_12osoos)==null?void 0:h.base)??"/corpus-building";var y;const C=((y=globalThis.__sveltekit_12osoos)==null?void 0:y.assets)??z;export{S as a,z as b,C as c,E as d,j as g,k as r,x as w};