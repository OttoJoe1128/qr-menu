import { useState } from "react";
import QRCode from "qrcode";

export default function QrGeneratorTab() {
  const [masaNumarasi, setMasaNumarasi] = useState<string>("1");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [basariMesaji, setBasariMesaji] = useState<string | null>(null);

  async function uretQrKod(): Promise<void> {
    setHataMesaji(null);
    setBasariMesaji(null);
    const table = masaNumarasi.trim();
    if (table.length === 0) {
      setHataMesaji("Masa numarası zorunludur.");
      return;
    }
    try {
      const url = `${window.location.origin}/menu?table=${encodeURIComponent(table)}`;
      const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 320 });
      setQrDataUrl(dataUrl);
      setBasariMesaji("QR oluşturuldu.");
    } catch (err) {
      setHataMesaji("QR Kod üretilirken bir hata oluştu.");
    }
  }

  return (
    <section className="admin__card">
      {hataMesaji && <div className="admin__alert admin__alert--error">{hataMesaji}</div>}
      {basariMesaji && <div className="admin__alert admin__alert--success">{basariMesaji}</div>}
      <label className="admin__field">
        <span className="admin__label">Masa numarası</span>
        <input className="admin__input" value={masaNumarasi} onChange={(e) => setMasaNumarasi(e.target.value)} placeholder="Örn: 12" />
      </label>
      <button className="admin__primary" onClick={() => void uretQrKod()}>
        QR Oluştur
      </button>
      {qrDataUrl && (
        <div className="admin__qr">
          <img className="admin__qrImg" src={qrDataUrl} alt="QR Kod" />
          <div className="admin__hint">
            QR linki: <code>{`${window.location.origin}/menu?table=${encodeURIComponent(masaNumarasi.trim())}`}</code>
          </div>
        </div>
      )}
    </section>
  );
}
