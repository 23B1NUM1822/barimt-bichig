interface PaymentMethod {
  fee(amount: number): number;
  validate(amount: number): boolean;
  describe(): string;
}

class CardPayment implements PaymentMethod {
  fee(amount: number): number { return amount * 0.025; }
  validate(amount: number): boolean { return amount > 0; }
  describe(): string { return "Card"; }
}

class QPayPayment implements PaymentMethod {
  fee(amount: number): number { return amount * 0.005; }
  validate(amount: number): boolean { return amount > 0; }
  describe(): string { return "QPay"; }
}

class BankTransfer implements PaymentMethod {
  fee(): number { return 500; }
  validate(amount: number): boolean { return amount >= 10_000; }
  describe(): string { return "Bank"; }
}

class CashPayment implements PaymentMethod {
  fee(): number { return 0; }
  validate(amount: number): boolean { return amount <= 500_000; }
  describe(): string { return "Cash"; }
}

type PaymentType = "card" | "qpay" | "bank" | "cash";

const paymentMethods: Record<PaymentType, PaymentMethod> = {
  card: new CardPayment(),
  qpay: new QPayPayment(),
  bank: new BankTransfer(),
  cash: new CashPayment(),
};

class PaymentProcessor {
  process(type: PaymentType, amount: number): string {
    const method = paymentMethods[type];
    if (!method.validate(amount)) {
      throw new Error(`${type}: дүн буруу байна`);
    }
    return `${method.describe()}: ${amount}₮ + ${method.fee(amount)}₮ шимтгэл`;
  }
}

// --- Шалгах код (өөрчлөхгүй) ---
const processor = new PaymentProcessor();
for (const type of ["card", "qpay", "bank", "cash"] as const) {
  console.log(processor.process(type, 50_000));
}
