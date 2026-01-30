// ==================== PRICING RULES ====================
export const PRICING_RULES = {
  byArea: [
    { max: 50, price: 110 },
    { max: 80, price: 130 },
    { max: 120, price: 160 },
    { max: 180, price: 200 },
    { max: 250, price: 260 },
    { max: Infinity, price: 320 }
  ],
  multipliers: {
    apartment: 1.0,
    house: 1.1,
    townhouse: 1.2
  },
  extras: {
    stairs: 20,
    yard: 30,
    extraBathroom: 15,
    petSmall: 20,
    petMedium: 35,
    petLarge: 35,
    heavyDirt: 40,
    postConstruction: 120
  }
};

// ==================== PLATFORM FEES ====================
export const PLATFORM_FEES = {
  intermediation: 0.05,  // 5%
  protection: 0.04,      // 4%
  financial: 0.02,       // 2%
  total: 0.11            // 11%
};

// Royalty to IPO IP & Branding (Lumio)
export const ROYALTY_RATE = 0.04;  // 4% of platform revenue (not GMV)

// ==================== JOB STATUSES ====================
export const JOB_STATUS = {
  DRAFT: 'draft',
  AUTHORIZED: 'authorized',
  SEARCHING: 'searching',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CONFIRMED: 'confirmed',
  CAPTURED: 'captured',
  PAID_OUT: 'paid_out',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled'
};

export const JOB_STATUS_LABELS = {
  draft: 'Rascunho',
  authorized: 'Autorizado',
  searching: 'Buscando Prestador',
  accepted: 'Aceito',
  in_progress: 'Em Andamento',
  completed: 'Concluído',
  confirmed: 'Confirmado',
  captured: 'Pago',
  paid_out: 'Repassado',
  disputed: 'Em Disputa',
  cancelled: 'Cancelado'
};

// ==================== USER ROLES ====================
export const USER_ROLES = {
  CLIENT: 'client',
  PROVIDER: 'provider',
  ADMIN_MASTER: 'admin_master',
  ADMIN_FINANCE: 'admin_finance',
  ADMIN_ACCOUNTING: 'admin_accounting',
  ADMIN_OPERATION: 'admin_operation'
};

// ==================== PROPERTY TYPES ====================
export const PROPERTY_TYPES = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  TOWNHOUSE: 'townhouse'
};

export const PROPERTY_TYPE_LABELS = {
  apartment: 'Apartamento',
  house: 'Casa',
  townhouse: 'Sobrado'
};

// ==================== PETS ====================
export const PET_OPTIONS = [
  { value: 'none', label: 'Nenhum', price: 0 },
  { value: 'small', label: 'Pequeno', price: 20 },
  { value: 'medium', label: 'Médio', price: 35 },
  { value: 'large', label: 'Grande', price: 35 }
];

// ==================== DIRT LEVELS ====================
export const DIRT_LEVELS = [
  { value: 'light', label: 'Leve', price: 0 },
  { value: 'medium', label: 'Médio', price: 0 },
  { value: 'heavy', label: 'Pesado', price: 40 }
];

// ==================== CALCULATION FUNCTIONS ====================

/**
 * Calculate base price for a property
 */
export function calculatePrice(property) {
  if (!property) return 0;

  // Base price by area
  let basePrice = PRICING_RULES.byArea.find(r => property.area <= r.max)?.price || 320;

  // Apply type multiplier
  basePrice *= PRICING_RULES.multipliers[property.type] || 1.0;

  // Add extras
  if (property.has_stairs) basePrice += PRICING_RULES.extras.stairs;
  if (property.has_yard) basePrice += PRICING_RULES.extras.yard;
  if (property.bathrooms > 1) {
    basePrice += PRICING_RULES.extras.extraBathroom * (property.bathrooms - 1);
  }

  // Pets
  if (property.pets === 'small') basePrice += PRICING_RULES.extras.petSmall;
  if (property.pets === 'medium' || property.pets === 'large') {
    basePrice += PRICING_RULES.extras.petMedium;
  }

  // Dirt level
  if (property.dirt_level === 'heavy') basePrice += PRICING_RULES.extras.heavyDirt;

  // Service type
  if (property.service_type === 'post-construction') {
    basePrice += PRICING_RULES.extras.postConstruction;
  }

  return Math.round(basePrice);
}

/**
 * Calculate all fees for a given service amount
 */
export function calculateFees(serviceAmount) {
  const intermediation = serviceAmount * PLATFORM_FEES.intermediation;
  const protection = serviceAmount * PLATFORM_FEES.protection;
  const financial = serviceAmount * PLATFORM_FEES.financial;
  const totalPlatformFee = intermediation + protection + financial;
  
  // Royalty is 4% of platform revenue (not GMV)
  const royalty = totalPlatformFee * ROYALTY_RATE;

  return {
    serviceAmount,
    intermediation: Number(intermediation.toFixed(2)),
    protection: Number(protection.toFixed(2)),
    financial: Number(financial.toFixed(2)),
    totalPlatformFee: Number(totalPlatformFee.toFixed(2)),
    royalty: Number(royalty.toFixed(2)),
    clientTotal: Number((serviceAmount + totalPlatformFee).toFixed(2)),
    providerNet: serviceAmount,
    platformNet: Number((totalPlatformFee - royalty).toFixed(2))
  };
}

/**
 * Format currency in BRL
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Format date in Brazilian format
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}
