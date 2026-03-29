export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const calcCheckDigit = (base: string, factor: number) => {
    let total = 0;
    for (const char of base) {
      total += Number(char) * factor--;
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calcCheckDigit(digits.substring(0, 9), 10);
  const secondDigit = calcCheckDigit(digits.substring(0, 10), 11);

  return digits.endsWith(`${firstDigit}${secondDigit}`);
}

export function isValidGbCode(code: string): boolean {
  return /^[A-Z]{2}\d{4}$/i.test(code.trim());
}
