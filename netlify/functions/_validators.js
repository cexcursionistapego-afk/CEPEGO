// Validadors de format compartits pels formularis de soci (alta/baixa).

function normDigits(v) { return (v || '').replace(/\D/g, ''); }

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
}

function isValidPhone(v) {
  var d = normDigits(v);
  if (d.length === 11 && d.slice(0, 2) === '34') d = d.slice(2);
  return /^[6789]\d{8}$/.test(d);
}

function isValidDNI(v) {
  var t = (v || '').trim().toUpperCase();
  return /^\d{8}[A-Z]$/.test(t) || /^[XYZ]\d{7}[A-Z]$/.test(t);
}

function isValidIBAN(v) {
  var t = (v || '').replace(/\s/g, '').toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(t);
}

module.exports = { isValidEmail, isValidPhone, isValidDNI, isValidIBAN };
