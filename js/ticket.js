(function () {
  var css = `
  .tk-overlay{position:fixed;inset:0;background:rgba(27,23,48,.55);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;z-index:300;overflow-y:auto}
  .tk{background:#fff;width:100%;max-width:420px;border-radius:18px;padding:28px 24px;box-shadow:0 20px 50px rgba(0,0,0,.25);font-size:13.5px;color:var(--ink,#201B33)}
  .tk-head{text-align:center;border-bottom:2px dashed #d9d3f3;padding-bottom:16px;margin-bottom:16px}
  .tk-head h2{font-family:'Baloo 2',sans-serif;font-size:26px;color:var(--purple-dark,#5b49b8);margin:0}
  .tk-head p{margin:2px 0;color:var(--ink-soft,#6b6685);font-size:12.5px}
  .tk-sec{margin-bottom:14px}
  .tk-sec h3{font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-soft,#6b6685);margin:0 0 6px}
  .tk-row{display:flex;justify-content:space-between;gap:12px;padding:4px 0}
  .tk-row span:last-child{text-align:right;overflow-wrap:anywhere}
  .tk-items{border-top:1px solid #eee;border-bottom:1px solid #eee;padding:6px 0}
  .tk-total{font-weight:700;font-size:17px;border-top:2px dashed #d9d3f3;margin-top:8px;padding-top:10px}
  .tk-foot{text-align:center;color:var(--ink-soft,#6b6685);font-size:12px;margin-top:14px}
  .tk-actions{display:flex;gap:10px;margin-top:18px}
  .tk-actions button{flex:1;min-height:46px;border-radius:999px;border:none;font:inherit;font-weight:600;cursor:pointer}
  .tk-pdf{background:var(--purple,#7a6ad8);color:#fff}
  .tk-close{background:#f2f0f8;color:var(--ink,#201B33)}
  @media print{
    body>*:not(.tk-overlay){display:none!important}
    .tk-overlay{position:static;background:none;padding:0;display:block}
    .tk{box-shadow:none;max-width:100%;margin:0 auto}
    .tk-actions{display:none}
  }`;
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var KEY = 'bb_orders';
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function money(n){return '$'+(Number(n)||0).toLocaleString('es-MX')+' MXN';}
  function fecha(iso){
    var d=new Date(iso); if(isNaN(d)) return '—';
    return d.toLocaleString('es-MX',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'});
  }

  function ticketHTML(o){
    var c=o.customer||{};
    var items=(o.items||[]).map(function(i){
      return '<div class="tk-row"><span>'+esc(i.qty)+' × '+esc(i.name)+'</span><span>'+money(i.price*i.qty)+'</span></div>';
    }).join('');
    return '<div class="tk">'+
      '<div class="tk-head"><h2>Blindbox MX</h2><p>Comprobante de compra</p>'+
      '<p><strong>Folio:</strong> '+esc(o.id)+'</p><p>'+esc(fecha(o.date))+'</p></div>'+
      '<div class="tk-sec"><h3>Cliente</h3>'+
        '<div class="tk-row"><span>Nombre</span><span>'+esc(c.name||'—')+'</span></div>'+
        '<div class="tk-row"><span>Correo</span><span>'+esc(c.email||'—')+'</span></div>'+
        '<div class="tk-row"><span>Teléfono</span><span>'+esc(c.phone||'—')+'</span></div>'+
        '<div class="tk-row"><span>Envío</span><span>'+esc(c.address||'—')+'</span></div></div>'+
      '<div class="tk-sec"><h3>Productos</h3><div class="tk-items">'+(items||'<div class="tk-row"><span>Sin productos</span></div>')+'</div></div>'+
      '<div class="tk-row"><span>Subtotal</span><span>'+money(o.subtotal)+'</span></div>'+
      (o.discount?'<div class="tk-row"><span>Descuento'+(o.discountCode?' ('+esc(o.discountCode)+')':'')+'</span><span>-'+money(o.discount)+'</span></div>':'')+
      '<div class="tk-row tk-total"><span>Total</span><span>'+money(o.total)+'</span></div>'+
      '<div class="tk-row"><span>Método de pago</span><span>'+esc(o.payment||'—')+'</span></div>'+
      '<p class="tk-foot">¡Gracias por tu compra! · Comprobante de demostración</p>'+
      '<div class="tk-actions"><button type="button" class="tk-pdf">Descargar PDF</button><button type="button" class="tk-close">Cerrar</button></div>'+
    '</div>';
  }

  function open(o){
    close();
    var ov=document.createElement('div');
    ov.className='tk-overlay';
    ov.innerHTML=ticketHTML(o);
    document.body.appendChild(ov);
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    ov.querySelector('.tk-close').onclick=close;
    ov.querySelector('.tk-pdf').onclick=function(){
      var t=document.title; document.title='Ticket-'+o.id;
      window.print();
      document.title=t;
    };
  }
  function close(){ var x=document.querySelector('.tk-overlay'); if(x) x.remove(); }

  function getOrders(){
    try{ var v=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(v)?v:[]; }catch(e){ return []; }
  }
  function saveOrder(o){
    var l=getOrders(); l.unshift(o);
    try{ localStorage.setItem(KEY,JSON.stringify(l)); }catch(e){}
  }

  window.BBTicket={open:open,close:close,getOrders:getOrders,saveOrder:saveOrder,money:money,fecha:fecha};
})();