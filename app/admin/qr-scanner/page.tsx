'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle, AlertCircle, Loader, RefreshCw, Camera } from 'lucide-react';
import { QRCamera } from '@/components/qr-camera';

interface ScannedItem {
  barcode: string;
  item_name: string;
  sku: string;
  qty_ordered: number;
  qty_scanned: number;
  order_number: string;
  scan_type: string;
  timestamp: string;
  status: 'success' | 'error';
}

export default function QRScannerPage() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanType, setScanType] = useState('PICK');
  const [scannedBy, setScannedBy] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [qtyScanned, setQtyScanned] = useState(1);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<ScannedItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCameraResult = (qrResult: string) => {
    setBarcodeInput(qrResult);
    setCameraOpen(false);
    // Auto-trigger scan after a brief delay
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleScan = async (orderNumber: string) => {
    if (!orderNumber.trim() || !scannedBy.trim()) {
      alert('Por favor ingresa un número de orden y tu usuario');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/inventory/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_number: orderNumber.trim(),
          scan_type: scanType,
          scanned_by: scannedBy.trim(),
          device_id: deviceId.trim() || 'WEB_SCANNER',
        }),
      });

      const result = await response.json();

      if (result.success) {
        const scanData = result.data;
        const newScan: ScannedItem = {
          barcode: orderNumber.trim(),
          item_name: `Orden entregada (${scanData.items_count} artículos)`,
          sku: orderNumber.trim(),
          qty_ordered: scanData.items_count,
          qty_scanned: scanData.items_count,
          order_number: orderNumber.trim(),
          scan_type: scanType,
          timestamp: new Date().toLocaleTimeString('es-ES'),
          status: 'success',
        };

        setLastScan(newScan);
        setScannedItems([newScan, ...scannedItems]);
        setBarcodeInput('');
        setShowDialog(true);

        if (inputRef.current) {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      } else {
        const errorScan: ScannedItem = {
          barcode: orderNumber.trim(),
          item_name: result.error || 'Orden no encontrada',
          sku: 'N/A',
          qty_ordered: 0,
          qty_scanned: 0,
          order_number: 'N/A',
          scan_type: scanType,
          timestamp: new Date().toLocaleTimeString('es-ES'),
          status: 'error',
        };

        setLastScan(errorScan);
        setScannedItems([errorScan, ...scannedItems]);
        setBarcodeInput('');
      }
    } catch (error) {
      console.error('Error scanning:', error);
      alert('Error al procesar el escaneo');
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = () => {
    handleScan(barcodeInput);
  };

  const clearScans = () => {
    setScannedItems([]);
    setLastScan(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const totalScans = scannedItems.length;
  const successScans = scannedItems.filter((item) => item.status === 'success').length;
  const errorScans = scannedItems.filter((item) => item.status === 'error').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Escáner de Códigos QR</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Escanea órdenes para registrar entregas y actualizar estados
        </p>
      </div>

      {/* Panel de Control */}
      <Card>
        <CardHeader>
          <CardTitle>Control de Escaneo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Datos de Usuario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Usuario *</label>
              <Input
                placeholder="Nombre de usuario"
                value={scannedBy}
                onChange={(e) => setScannedBy(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ID del Dispositivo</label>
              <Input
                placeholder="Identificador del dispositivo (opcional)"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
              />
            </div>
          </div>

          {/* Opciones de Escaneo */}
          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Escaneo</label>
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PICK">Pick (Seleccionar)</SelectItem>
                  <SelectItem value="PACK">Pack (Empacar)</SelectItem>
                  <SelectItem value="LOAD">Load (Cargar)</SelectItem>
                  <SelectItem value="DELIVER">Deliver (Entregar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cantidad</label>
              <Input
                type="number"
                min="1"
                value={qtyScanned}
                onChange={(e) => setQtyScanned(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Número de Orden *</label>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Escanea un código QR de orden o ingresa el número manualmente"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualScan();
                    }
                  }}
                  disabled={loading}
                  autoFocus
                />
                <Button
                  onClick={() => setCameraOpen(true)}
                  disabled={loading}
                  variant="outline"
                  className="px-3"
                  title="Abrir cámara para escanear"
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleManualScan}
                  disabled={loading || !barcodeInput.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    'Escanear'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Nota de Uso */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Instrucciones:</strong> Ingresa tu usuario, selecciona el tipo de escaneo (DELIVER para marcar como entregada), y luego coloca el cursor en el campo de número de orden para escanear o escribir manualmente. Cada escaneo registrará todos los artículos de la orden.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">Total de Escaneos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalScans}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-green-600">Exitosos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{successScans}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-600">Errores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{errorScans}</div>
          </CardContent>
        </Card>
        <div className="flex items-end">
          <Button
            onClick={clearScans}
            variant="outline"
            className="w-full gap-2"
            disabled={scannedItems.length === 0}
          >
            <RefreshCw className="w-4 h-4" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Último Escaneo */}
      {lastScan && (
        <Card className={lastScan.status === 'success' ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastScan.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              Último Escaneo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500">SKU</div>
                <div className="font-mono font-bold">{lastScan.sku}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Artículo</div>
                <div className="font-bold">{lastScan.item_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Cantidad</div>
                <div className="font-bold">{lastScan.qty_scanned}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Orden</div>
                <div className="font-mono font-bold">{lastScan.order_number}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Escaneos */}
      {scannedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Escaneos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scannedItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-l-4 flex items-start justify-between ${
                    item.status === 'success'
                      ? 'bg-green-50 dark:bg-green-950 border-green-500'
                      : 'bg-red-50 dark:bg-red-950 border-red-500'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-mono font-bold text-sm">{item.sku}</div>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        {item.scan_type}
                      </span>
                    </div>
                    <div className="text-sm mt-1">{item.item_name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Orden: {item.order_number} • Cantidad: {item.qty_scanned}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {item.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Confirmación */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lastScan?.status === 'success' ? 'Escaneo Exitoso' : 'Error en el Escaneo'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lastScan?.status === 'success'
                ? `${lastScan?.item_name} (SKU: ${lastScan?.sku}) - Cantidad: ${lastScan?.qty_scanned}`
                : `No se encontró artículo con código: ${lastScan?.barcode}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowDialog(false)}>
            Continuar
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Camera Modal */}
      <QRCamera
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onScan={handleCameraResult}
      />
    </div>
  );
}
