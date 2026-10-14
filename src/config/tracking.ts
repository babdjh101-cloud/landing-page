/**
 * Google Tag Manager (GTM) Central Configuration
 * 
 * Replace 'GTM-XXXXXXX' with your real GTM container ID from Google Tag Manager dashboard.
 * When GTM_ENABLED is false or container ID is 'GTM-XXXXXXX', the script injection is safely bypassed,
 * while dataLayer events continue to record reliably in window.dataLayer for inspection and testing.
 */
export const GTM_CONTAINER_ID = 'GTM-XXXXXXX';

export const GTM_ENABLED = false;

export const TRACKING_CONFIG = {
  containerId: GTM_CONTAINER_ID,
  enabled: GTM_ENABLED,
  currency: 'BDT',
  // Cash on Delivery (COD) Measurement Policy:
  // In Bangladesh e-commerce, the `purchase` event is fired upon authoritative server confirmation
  // that the order was received and persisted with a unique public order reference.
  // It represents an intent-to-buy commitment with COD payment status = UNPAID.
  // Delivery and cash reconciliation happen post-dispatch in the warehouse/courier workflow.
  codMeasurementPolicy: 'ORDER_PLACED_UNPAID_COD',
};
