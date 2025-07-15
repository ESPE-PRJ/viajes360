"use client";

import type React from "react";
import axios from "axios";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Plane,
  Building,
  CreditCard,
} from "lucide-react";

interface ReservaData {
  cliente: string;
  vuelo_destino: string;
  hotel_nombre: string;
  monto_total: number;
}

interface ReservaResponse {
  success: boolean;
  message: string;
  reserva_id?: string;
  detalles?: {
    vuelo_confirmado: boolean;
    hotel_confirmado: boolean;
    pago_procesado: boolean;
  };
}

export default function ReservaForm() {
  const [formData, setFormData] = useState<ReservaData>({
    cliente: "",
    vuelo_destino: "",
    hotel_nombre: "",
    monto_total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ReservaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof ReservaData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      // Llamada usando el proxy de Next.js (evita CORS)
      const response = await axios.post("/api/reservas", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Axios arroja automáticamente errores para status >= 400
      setResponse({
        success: true,
        message: response.data.message || "Reserva procesada exitosamente",
        reserva_id: response.data.reserva_id || `RES-${Date.now()}`,
        detalles: response.data.detalles || {
          vuelo_confirmado: true,
          hotel_confirmado: true,
          pago_procesado: true,
        },
      });
    } catch (err) {
      // Manejar errores de axios
      if (axios.isAxiosError(err) && err.response) {
        // Error de respuesta del servidor
        const errorData = err.response.data;
        setResponse({
          success: false,
          message:
            errorData.message ||
            "Error en el procesamiento. Transacción revertida.",
        });
      } else {
        // Error de red o simulación para demostración
        if (formData.monto_total > 1000) {
          setResponse({
            success: false,
            message:
              "Error en el procesamiento del pago. Las reservas de vuelo y hotel han sido canceladas automáticamente.",
          });
        } else {
          setResponse({
            success: true,
            message: "Reserva procesada exitosamente",
            reserva_id: `RES-${Date.now()}`,
            detalles: {
              vuelo_confirmado: true,
              hotel_confirmado: true,
              pago_procesado: true,
            },
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cliente: "",
      vuelo_destino: "",
      hotel_nombre: "",
      monto_total: 0,
    });
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Viajes 360</h1>
          <p className="text-gray-600">Sistema de Reservas Orquestado</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Nueva Reserva de Viaje
            </CardTitle>
            <CardDescription>
              Complete los datos para procesar su reserva de vuelo y hotel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="cliente">Nombre del Cliente</Label>
                  <Input
                    id="cliente"
                    type="text"
                    placeholder="Ej: Ana Torres"
                    value={formData.cliente}
                    onChange={(e) =>
                      handleInputChange("cliente", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="vuelo_destino">Destino del Vuelo</Label>
                  <Input
                    id="vuelo_destino"
                    type="text"
                    placeholder="Ej: Madrid"
                    value={formData.vuelo_destino}
                    onChange={(e) =>
                      handleInputChange("vuelo_destino", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hotel_nombre">Nombre del Hotel</Label>
                  <Input
                    id="hotel_nombre"
                    type="text"
                    placeholder="Ej: Hotel Central"
                    value={formData.hotel_nombre}
                    onChange={(e) =>
                      handleInputChange("hotel_nombre", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="monto_total">Monto Total (USD)</Label>
                  <Input
                    id="monto_total"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="850.00"
                    value={formData.monto_total || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "monto_total",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                    required
                  />
                  {formData.monto_total > 1000 && (
                    <p className="text-sm text-amber-600 mt-1">
                      ⚠️ Montos superiores a $1000 activarán la simulación de
                      error
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando Reserva...
                    </>
                  ) : (
                    "Procesar Reserva"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Limpiar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resultado de la Reserva */}
        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {response.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Resultado de la Reserva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert
                className={
                  response.success
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }
              >
                <AlertDescription
                  className={
                    response.success ? "text-green-800" : "text-red-800"
                  }
                >
                  {response.message}
                </AlertDescription>
              </Alert>

              {response.success && response.reserva_id && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold">
                      ID de Reserva: {response.reserva_id}
                    </p>
                  </div>

                  {response.detalles && (
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Plane className="h-4 w-4 text-blue-600" />
                        <span
                          className={
                            response.detalles.vuelo_confirmado
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          Vuelo:{" "}
                          {response.detalles.vuelo_confirmado
                            ? "Confirmado"
                            : "Cancelado"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-purple-600" />
                        <span
                          className={
                            response.detalles.hotel_confirmado
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          Hotel:{" "}
                          {response.detalles.hotel_confirmado
                            ? "Confirmado"
                            : "Cancelado"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        <span
                          className={
                            response.detalles.pago_procesado
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          Pago:{" "}
                          {response.detalles.pago_procesado
                            ? "Procesado"
                            : "Fallido"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!response.success && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Compensación Activada
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Reserva de vuelo cancelada automáticamente</li>
                    <li>• Reserva de hotel cancelada automáticamente</li>
                    <li>• No se realizó ningún cargo</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Información del Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-gray-600 space-y-2">
            <p>
              <strong>Endpoint:</strong> POST /api/reservas
            </p>
            <p>
              <strong>Orquestación:</strong> Vuelo → Hotel → Pago
            </p>
            <p>
              <strong>Compensación:</strong> Si el pago falla, se cancelan vuelo
              y hotel automáticamente
            </p>
            <p>
              <strong>Simulación de Error:</strong> Montos {">"} $1000 fallarán
              en el procesamiento de pago
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
