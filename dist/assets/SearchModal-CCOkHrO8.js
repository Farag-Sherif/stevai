import{j as e}from"./query-DSiVOYhP.js";import{r as d}from"./react-CeLKKlBP.js";import{u as y,T as N,H as b,L as f,C as v,k as w}from"./index-DYvsNyvA.js";const S=(s,r)=>{const[i,n]=d.useState(s);return d.useEffect(()=>{const o=setTimeout(()=>{n(s)},r);return()=>{clearTimeout(o)}},[s,r]),i},C=({product:s,locale:r})=>{const i=(c,h,p)=>!c||!c.translations||!Array.isArray(c.translations)?c?.[p]||"":c.translations.find(x=>x.locale===h)?.[p]||c?.[p]||"",n=i(s,r,"name"),o=i(s,r,"description"),t=typeof o=="string"?o.replace(/<[^>]*>/g,"").replace(/\s+/g," ").trim():o,a=b(s),m=a.hasDiscount;return e.jsxs("div",{className:"card-product style-search-result",children:[e.jsx("div",{className:"card-product-wrapper",children:e.jsx(f,{href:`/product-detail/${s.id}-${n.replace(/\s+/g,"-").toLowerCase()}`,className:"product-img",children:e.jsx(v,{className:"lazyload img-product",src:w(s),alt:n,width:120,height:120})})}),e.jsxs("div",{className:"card-product-info",children:[e.jsx(f,{href:`/product-detail/${s.id}-${n.replace(/\s+/g,"-").toLowerCase()}`,className:"title link",children:n}),e.jsxs("span",{className:"price",children:[m&&e.jsx("span",{className:"old-price",children:r==="ar"?`ج.م ${a.originalPriceWithTax.toFixed(2)}`:`EGP ${a.originalPriceWithTax.toFixed(2)}`})," ",r==="ar"?`ج.م ${a.finalPrice.toFixed(2)}`:`EGP ${a.finalPrice.toFixed(2)}`]}),t&&e.jsx("p",{className:"description text-caption-1 text-secondary",children:t.length>80?`${t.substring(0,80)}...`:t})]})]})};function P(){const s=y(),[r,i]=d.useState(!1),[n,o]=d.useState(""),[t,a]=d.useState([]),[m,c]=d.useState(!1),h=S(n,500);d.useEffect(()=>{(async()=>{if(h.trim().length<2){a([]),c(!1);return}i(!0),c(!0);try{const u=await N(h.trim()),j=u?.data||u||[];a(j)}catch(u){console.error("Search error:",u),a([])}finally{i(!1)}})()},[h]);const p=l=>{o(l.target.value)},g=l=>{l.preventDefault()},x=()=>{o(""),a([]),c(!1)};return e.jsxs("div",{className:"modal fade modal-search",id:"search",children:[e.jsx("style",{children:`
        /* Prevent the global product-card hover swap inside search results */
        .modal-search .card-product.style-search-result .card-product-wrapper:hover .product-img .img-product {
          opacity: 1 !important;
          transform: none !important;
        }
        .modal-search .card-product.style-search-result .card-product-wrapper:hover .product-img .img-hover {
          display: none !important;
          opacity: 0 !important;
          transform: none !important;
        }
        
        /* Grid layout for search results */
        .search-products-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 15px;
        }

        /* Flex row for individual search result items */
        .card-product.style-search-result {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ebebeb;
        }
        
        .card-product.style-search-result:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .card-product.style-search-result .card-product-wrapper {
          flex: 0 0 100px;
          min-width: 100px;
          width: 100px;
          border-radius: 8px;
          overflow: hidden;
        }

        .card-product.style-search-result .card-product-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .card-product.style-search-result .title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .card-product.style-search-result .price {
          font-size: 15px;
          font-weight: 500;
          color: #222;
          margin-bottom: 6px;
        }

        .card-product.style-search-result .description {
          margin: 0;
          line-height: 1.4;
        }
      `}),e.jsx("div",{className:"modal-dialog modal-dialog-centered",children:e.jsxs("div",{className:"modal-content",children:[e.jsxs("div",{className:"d-flex justify-content-between align-items-center",children:[e.jsx("h5",{children:s==="ar"?"البحث":"Search"}),e.jsx("span",{className:"icon-close icon-close-popup","data-bs-dismiss":"modal",onClick:x})]}),e.jsxs("form",{className:"form-search",onSubmit:g,children:[e.jsx("fieldset",{className:"text",children:e.jsx("input",{type:"text",placeholder:s==="ar"?"البحث...":"Searching...",className:"",name:"text",tabIndex:0,value:n,onChange:p,"aria-required":"true",required:!0})}),e.jsx("button",{className:"",type:"submit",disabled:r,children:r?e.jsx("div",{className:"spinner-border spinner-border-sm",role:"status",children:e.jsx("span",{className:"visually-hidden",children:"Loading..."})}):e.jsxs("svg",{className:"icon",width:20,height:20,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("path",{d:"M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z",stroke:"#181818",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M21.35 21.0004L17 16.6504",stroke:"#181818",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"})]})})]}),m&&e.jsx("div",{className:"search-results",children:r?e.jsxs("div",{className:"text-center py-3",children:[e.jsx("div",{className:"spinner-border text-primary",role:"status",children:e.jsx("span",{className:"visually-hidden",children:s==="ar"?"جاري البحث...":"Searching..."})}),e.jsx("p",{className:"mt-2 text-muted",children:s==="ar"?"جاري البحث...":"Searching..."})]}):t.length>0?e.jsxs(e.Fragment,{children:[e.jsx("h6",{className:"mb-3",children:s==="ar"?`تم العثور على ${t.length} منتج`:`Found ${t.length} product${t.length!==1?"s":""}`}),e.jsx("div",{className:"search-products-grid",children:t.map(l=>e.jsx(C,{product:l,locale:s},l.id))})]}):e.jsx("div",{className:"text-center py-3",children:e.jsx("p",{className:"text-muted",children:s==="ar"?"لم يتم العثور على منتجات مطابقة لبحثك":"No products found matching your search"})})})]})})]})}export{P as default};
