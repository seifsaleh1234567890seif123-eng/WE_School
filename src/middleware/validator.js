// Egyptian National ID & Data Validation Engine

const EGYPT_GOV_CODES = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
  '88': 'خارج الجمهورية'
};

function parseEgyptianNationalID(nid) {
  if (!nid || typeof nid !== 'string' || !/^\d{14}$/.test(nid.trim())) {
    return { valid: false, error: 'الرقم القومي يجب أن يتكون من 14 رقماً صحيحاً.' };
  }

  const s = nid.trim();
  const centuryDigit = parseInt(s[0], 10);
  if (centuryDigit !== 2 && centuryDigit !== 3) {
    return { valid: false, error: 'الرقم القومي غير مطابق لمحددات القرن.' };
  }

  const yearPrefix = centuryDigit === 3 ? '20' : '19';
  const birthYear = parseInt(yearPrefix + s.substring(1, 3), 10);
  const birthMonth = parseInt(s.substring(3, 5), 10);
  const birthDay = parseInt(s.substring(5, 7), 10);

  if (birthMonth < 1 || birthMonth > 12) {
    return { valid: false, error: 'شهر الميلاد في الرقم القومي غير صحيح.' };
  }
  if (birthDay < 1 || birthDay > 31) {
    return { valid: false, error: 'يوم الميلاد في الرقم القومي غير صحيح.' };
  }

  const govCode = s.substring(7, 9);
  const govName = EGYPT_GOV_CODES[govCode] || 'غير محدد';

  // Gender: 13th digit (odd: male, even: female)
  const genderDigit = parseInt(s[12], 10);
  const gender = genderDigit % 2 === 1 ? 'بنين' : 'بنات';

  // Calculate age on Oct 1st, 2026
  const targetDate = new Date(2026, 9, 1); // Oct 1, 2026
  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  
  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const mDiff = targetDate.getMonth() - birthDate.getMonth();
  if (mDiff < 0 || (mDiff === 0 && targetDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return {
    valid: true,
    birthDate: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
    age,
    governorate: govName,
    gender
  };
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

module.exports = {
  parseEgyptianNationalID,
  sanitizeString,
  EGYPT_GOV_CODES
};
