import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import HazardReportForm from '../features/hazards/HazardReportForm';
import HazardsList from '../features/hazards/HazardsList';
import { AlertTriangle } from 'lucide-react';

export default function HazardsPage() {
  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          Road Hazards
        </h1>
        <p className="mt-2 text-muted-foreground">
          Report hazards and view nearby dangers to stay safe on your route
        </p>
      </div>

      <Tabs defaultValue="report" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="report">Report Hazard</TabsTrigger>
          <TabsTrigger value="nearby">Nearby Hazards</TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Report a Road Hazard</CardTitle>
              <CardDescription>
                Help fellow riders by reporting dangerous conditions. Works offline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HazardReportForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby">
          <HazardsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
