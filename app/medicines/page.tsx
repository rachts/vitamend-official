"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Medicine {
  _id: string;
  name: string;
  quantity: number;
  expiryDate: string;
  brand: string;
  status: string;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5005');
        const res = await fetch(`${API_URL}/api/medicines`);
        const json = await res.json();
        if (json.success && json.data) {
          setMedicines(json.data);
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  return (
    <div className="container mx-auto p-10 pt-24 min-h-screen">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Available Medicines</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Browse through verified medicine donations available for redistribution.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      ) : medicines.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-slate-500">No medicines available at the moment.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((med) => (
            <Card key={med._id} className="overflow-hidden transition-all hover:shadow-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
                    {med.status}
                  </Badge>
                  <span className="text-xs text-slate-500">ID: {med._id.slice(-6)}</span>
                </div>
                <CardTitle className="text-xl font-bold mt-2">{med.name}</CardTitle>
                <p className="text-sm text-slate-500">{med.brand}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Quantity:</span>
                    <span className="font-semibold">{med.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Expiry:</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {new Date(med.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
