
// Data fetch and validation helpers
(function(global){
  // Simple type utils
  function isArray(x){ return Array.isArray(x); }
  function isObject(x){ return x && typeof x === 'object' && !Array.isArray(x); }
  function isString(x){ return typeof x === 'string'; }
  function isNumber(x){ return typeof x === 'number' && !Number.isNaN(x); }

  // Generic schema checker for arrays of records
  function validateArray(schema, arr){
    if(!isArray(arr)) return { ok:false, errors:['Expected an array'], data:[] };
    const out = [];
    const errs = [];
    for(const [i,row] of arr.entries()){
      if(!isObject(row)){ errs.push(`Row ${i}: not an object`); continue; }
      // required keys
      for(const key of (schema.required||[])){
        if(!(key in row)) errs.push(`Row ${i}: missing '${key}'`);
      }
      // type checks
      const types = schema.types || {};
      for(const [k,typ] of Object.entries(types)){
        const optional = /\?$/.test(typ);
        const t = typ.replace(/\?$/,'');
        const v = row[k];
        if(v==null){
          if(optional) continue;
          errs.push(`Row ${i}: '${k}' is null/undefined`); 
          continue;
        }
        const ok = (t==='string')? isString(v)
                : (t==='number')? isNumber(v)
                : (t==='array')? isArray(v)
                : (t==='object')? isObject(v)
                : true;
        if(!ok) errs.push(`Row ${i}: '${k}' expected ${t}`);
      }
      // rule checks
      for(const rule of (schema.rules||[])){
        try{
          if(!rule(row)) errs.push(`Row ${i}: rule failed`);
        }catch(e){
          errs.push(`Row ${i}: rule error`);
        }
      }
      // normalise: shallow copy with trimmed strings
      const clean = {};
      for(const [k,v] of Object.entries(row)){
        clean[k] = (isString(v)? v.trim() : v);
      }
      out.push(clean);
    }
    return { ok: errs.length===0, errors: errs, data: out };
  }

  // Schemas for this site

  const INFRA_SCHEMA = {
    required: ['category','year','title','details'],
    types: { category:'string', year:'number', title:'string', details:'string' },
    rules: [ r => r.year>=1980 && r.year <= new Date().getFullYear()+1 ]
  };

  const TL_SCHEMA = {
    required: ['year','title','details'],
    types: { year:'number', title:'string', details:'string' },
    rules: [ r => r.year>=1980 && r.year <= new Date().getFullYear()+1 ]
  };
  const POL_SCHEMA = {
    required: ['year','policy'],
    types: { year:'number', policy:'string', impact:'string?', details:'string?' },
    rules: [ r => r.year>=1980 && r.year <= new Date().getFullYear()+1 ]
  };
  // Fetch helper that tries multiple URLs in order
  async function fetchAny(urls, fallback, validateFn){
    for(const u of urls){
      try{
        const res = await fetch(u, { cache: 'no-store' });
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if(validateFn){
          const vr = validateFn(json);
          if(vr.ok) return vr.data;
          console.warn('Validation failed for', u, vr.errors);
          // try next candidate
          continue;
        }
        return json;
      }catch(e){
        // try next
      }
    }
    return fallback;
  }

  // Public API
  global.DataGuard = {
    validateTimeline(arr){ return validateArray(TL_SCHEMA, arr); },
    validatePolicies(arr){ return validateArray(POL_SCHEMA, arr); },
    validateInfrastructure(arr){ return validateArray(INFRA_SCHEMA, arr); },
    validateStats(obj){
      if(!isObject(obj)) return { ok:false, errors:['Expected object'], data:{} };
      const usersOk = isArray(obj.users) && obj.users.length > 0 &&
        obj.users.every(row => isObject(row) && isNumber(row.year) && isNumber(row.value));
      const speedsOk = isArray(obj.speeds) && obj.speeds.length > 0 &&
        obj.speeds.every(row => isObject(row) && isNumber(row.year) && isNumber(row.mobile_mbps));
      const penOk = isObject(obj.penetration) && isNumber(obj.penetration.percent);
      const errs=[];
      if(!usersOk) errs.push('users must be a non-empty array of numeric year/value records');
      if(!speedsOk) errs.push('speeds must be a non-empty array of numeric year/mobile_mbps records');
      if(!penOk) errs.push('penetration must be an object with a numeric percent');
      return { ok: errs.length===0, errors:errs, data: obj };
    },
    fetchAny
  };
})(window);
