export async function downloadExecutiveBrief({ simulationId, forecastId } : { simulationId?: string; forecastId?: string }) {
  const params = new URLSearchParams();
  if (simulationId) params.set('simulation_id', simulationId);
  if (forecastId) params.set('forecast_id', forecastId);
  const url = `${process.env.NEXT_PUBLIC_API_URL || ''}/report/download?` + params.toString();

  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`Report download failed: ${res.status}`);

  const blob = await res.blob();
  const filename = `BHARAT-TWIN_Executive_Brief_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

export default downloadExecutiveBrief;
