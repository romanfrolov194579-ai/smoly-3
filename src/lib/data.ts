export type GroupId = "services" | "sims" | "banks";

export type Product = {
  id: string;
  name: string;
  group: GroupId;
  desc: string;
  price: number;
  stock: number;
  icon: string; // ключ иконки lucide
  tag?: string;
};

export type CartLine = { productId: string; qty: number };

export type OrderItem = { id: string; name: string; price: number; qty: number };

export type OrderStatus = "pending" | "completed" | "declined";

export type Order = {
  id: string;
  userId: number;
  username: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
};

export const GROUPS: { id: GroupId; label: string; hint: string }[] = [
  { id: "services", label: "Сервисы", hint: "маркетплейсы и гос." },
  { id: "sims", label: "Симки ЛК", hint: "операторы связи" },
  { id: "banks", label: "Банки ЛК", hint: "банковские кабинеты" },
];

export const PRODUCTS: Product[] = [
  { id: "yandex_split", name: "Яндекс.Сплит", group: "services", desc: "Аккаунт с одобренным лимитом Сплит, привязка карты на вас", price: 490, stock: 14, icon: "wallet", tag: "Хит" },
  { id: "avito", name: "Авито", group: "services", desc: "Профиль с подтверждённым номером, без ограничений публикаций", price: 350, stock: 22, icon: "tag" },
  { id: "gosuslugi", name: "Госуслуги", group: "services", desc: "Учётка с подтверждённой личностью, полный доступ", price: 640, stock: 6, icon: "landmark" },
  { id: "max", name: "MAX", group: "services", desc: "Аккаунт мессенджера MAX с активной регистрацией", price: 250, stock: 31, icon: "message" },
  { id: "wb_limit", name: "ВБ Лимит", group: "services", desc: "Wildberries с повышенным лимитом выкупа и историей заказов", price: 520, stock: 9, icon: "bag", tag: "Best seller" },

  { id: "sim_t2", name: "Т2", group: "sims", desc: "Симка с входом в ЛК, баланс от 0 ₽, без долгов", price: 300, stock: 18, icon: "sim" },
  { id: "sim_megafon", name: "Мегафон", group: "sims", desc: "ЛК Мегафон, паспортные данные сменяемые", price: 320, stock: 12, icon: "sim" },
  { id: "sim_beeline", name: "Билайн", group: "sims", desc: "ЛК Билайн, номер оформлен, детализация доступна", price: 310, stock: 15, icon: "sim" },
  { id: "sim_mts", name: "MTS", group: "sims", desc: "ЛК МТС с приложением, управление тарифом", price: 330, stock: 10, icon: "sim" },

  { id: "ozon_bank", name: "Ozon Банк", group: "banks", desc: "ЛК Ozon Банка с выпущенной картой и кэшбеком", price: 700, stock: 7, icon: "coins" },
  { id: "t_bank", name: "Т-Банк", group: "banks", desc: "ЛК Т-Банка, счёт активен, история операций чистая", price: 850, stock: 5, icon: "card", tag: "Хит" },
  { id: "alfa_bank", name: "Alfa Bank", group: "banks", desc: "Альфа-Банк ЛК, дебетовая карта подключена", price: 750, stock: 8, icon: "building" },
  { id: "sber_bank", name: "Сбербанк", group: "banks", desc: "Сбербанк Онлайн, полный доступ, СБП активен", price: 900, stock: 4, icon: "piggy" },
];

export const ADMINS = ["samarskiyyyy", "bocha_bich"];

export const fmtRub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;

export const genOrderId = () => {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return `SM-${s}`;
};

export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const STATUS_META: Record<OrderStatus, { label: string; note: string }> = {
  pending: {
    label: "Ожидает оплаты",
    note: "Ожидаем подтверждения оплаты оператором. Обычно это занимает до 15 минут.",
  },
  completed: {
    label: "Оплачен",
    note: "Оплата подтверждена. Данные от аккаунтов отправлены вам в ЛС бота.",
  },
  declined: {
    label: "Ошибка оплаты",
    note: "Транзакция отклонена платёжной системой (код PAY-5021). Средства будут возвращены на карту в течение 24 часов.",
  },
};
