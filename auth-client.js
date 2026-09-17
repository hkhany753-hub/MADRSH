// MADRSH Authentication Client
// Connects the frontend to the authentication backend.

window.MADRSH_AUTH = {
  api: '/api/auth',

  async startRegister(name, phone) {
    const res = await fetch(this.api + '/start', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({name, phone})
    });
    return res.json();
  },

  async verifyCode(phone, code) {
    const res = await fetch(this.api + '/verify-code', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({phone, code})
    });
    return res.json();
  },

  async register(data) {
    const res = await fetch(this.api + '/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(phone, password) {
    const res = await fetch(this.api + '/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({phone,password})
    });
    return res.json();
  }
};
