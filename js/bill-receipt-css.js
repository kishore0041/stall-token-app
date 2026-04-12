/* Inlined so the bill works from file:// and avoids about:blank + external CSS issues */
window.BILL_RECEIPT_CSS = [
    '@page { size: 80mm auto; margin: 2mm; }',
    '* { box-sizing: border-box; }',
    'html, body { margin: 0; padding: 0; background: #fff; color: #000; }',
    'body { font-family: "Courier New", Courier, "Liberation Mono", monospace; }',
    '.receipt-wrap { padding: 12px; display: flex; justify-content: center; }',
    '.receipt { font-size: 11pt; line-height: 1.35; width: 72mm; max-width: 100%; background: #fff; color: #000; padding: 3mm 2mm 6mm; }',
    '.center { text-align: center; }',
    '.shop { font-weight: bold; font-size: 12pt; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 2mm; line-height: 1.25; }',
    '.owner { font-size: 9pt; margin-bottom: 1mm; font-weight: 600; }',
    '.addr { font-size: 8pt; margin-bottom: 2mm; line-height: 1.35; padding: 0 2mm; }',
    '.sub { font-size: 9pt; margin-bottom: 1mm; }',
    '.rule { border: none; border-top: 1px dashed #000; margin: 3mm 0; }',
    '.rule-bold { border: none; border-top: 1px solid #000; margin: 2mm 0; }',
    '.rline { display: flex; justify-content: space-between; align-items: baseline; gap: 4px; margin: 1.5mm 0; font-size: 10pt; }',
    '.rline .l { flex: 1; min-width: 0; word-wrap: break-word; padding-right: 4px; }',
    '.rline .r { flex-shrink: 0; text-align: right; font-variant-numeric: tabular-nums; }',
    '.tot { font-weight: bold; font-size: 11pt; margin-top: 2mm; }',
    '.thanks { text-align: center; font-size: 9pt; margin-top: 4mm; }',
    '@media print { body { background: #fff !important; } .receipt-wrap { padding: 0 !important; } .receipt { width: 72mm !important; max-width: 100% !important; } }'
].join('');
