
    
    const hamb = document.getElementById('hamb');
    const menu = document.getElementById('menu');
    hamb?.addEventListener('click', ()=> menu.classList.toggle('open'));
    menu?.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> menu.classList.remove('open')));

   
    document.querySelectorAll('[data-open]').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const id = btn.getAttribute('data-open');
        const modal = document.getElementById(id);
        if(modal){ modal.classList.add('open'); }
      })
    });

    
    document.querySelectorAll('.modal').forEach(m=>{
      m.addEventListener('click', (e)=>{ if(e.target === m) m.classList.remove('open'); })
    });
    window.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){ document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open')); }
    });

    function closeModal(id){
      const m = document.getElementById(id);
      if(m) m.classList.remove('open');
    }

    (function () {
  const form = document.querySelector('#cadastro .form');
  if (!form) return;

  const emailEl = document.getElementById('email');
  const nascEl  = document.getElementById('nascimento');
  const passEl  = document.getElementById('senha');
  const pass2El = document.getElementById('confirmasenha'); 


  if (emailEl) {
    emailEl.setAttribute('inputmode', 'email');
    emailEl.setAttribute('autocomplete', 'email');
  }
  if (nascEl) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    nascEl.max = `${yyyy}-${mm}-${dd}`;
  }
  if (passEl)  passEl.minLength = 6;
  if (pass2El) pass2El.minLength = 6;

  
  const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str);

  const getAge = (isoDate) => {
    const dob = new Date(isoDate);
    if (Number.isNaN(dob.getTime())) return -1;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  
  [emailEl, nascEl, passEl, pass2El].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => {
      el.setCustomValidity('');
      el.checkValidity(); 
    });
  });

  form.addEventListener('submit', (e) => {
    
    [emailEl, nascEl, passEl, pass2El].forEach(el => el && el.setCustomValidity(''));

    let ok = true;

    
    if (emailEl) {
      const v = emailEl.value.trim();
      if (!isValidEmail(v)) {
        emailEl.setCustomValidity('Informe um e-mail válido (ex: nome@dominio.com).');
        ok = false;
      }
    }

    
    if (nascEl) {
      const v = nascEl.value;
      if (!v) {
        nascEl.setCustomValidity('Informe sua data de nascimento.');
        ok = false;
      } else {
        const dob = new Date(v);
        const today = new Date(); today.setHours(0,0,0,0);
        if (dob > today) {
          nascEl.setCustomValidity('A data de nascimento não pode ser no futuro.');
          ok = false;
        } else {
          const age = getAge(v);
          if (age < 0) {
            nascEl.setCustomValidity('Data de nascimento inválida.');
            ok = false;
          } else if (age < 12) {
            nascEl.setCustomValidity('Você precisa ter pelo menos 12 anos.');
            ok = false;
          }
        }
      }
    }

  
    if (passEl) {
      const v = passEl.value;
      if (!v || v.length < 6) {
        passEl.setCustomValidity('A senha deve ter no mínimo 6 caracteres.');
        ok = false;
      }
    }

    
    if (passEl && pass2El) {
      if (pass2El.value !== passEl.value) {
        pass2El.setCustomValidity('As senhas não coincidem.');
        ok = false;
      }
    }

    if (!ok) {
      e.preventDefault();           
      form.reportValidity();        
    }
    
  });
})();
