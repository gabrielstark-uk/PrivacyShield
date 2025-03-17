import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Report, InsertReport } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { FileText, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReportSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Reports() {
  const { toast } = useToast();
  
  // Get regular reports
  const { data: reports } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  // Get threat reports
  const { data: threatReportsData } = useQuery<any>({
    queryKey: ["/api/threat-reports"],
  });

  // Extract threat reports from the response
  const threatReports = threatReportsData?.reports || [];

  const form = useForm({
    resolver: zodResolver(insertReportSchema),
    defaultValues: {
      frequency: 0,
      description: "",
    },
  });

  const createReport = useMutation({
    mutationFn: async (data: InsertReport) => {
      const res = await apiRequest("POST", "/api/reports", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Report Created",
        description: "Your report has been submitted successfully.",
      });
      form.reset();
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Reports & Incidents</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createReport.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency (Hz)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Submit Report
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Threat Reports Section */}
      {threatReports.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mt-8">Emergency Threat Reports</h2>
          <div className="grid gap-4">
            {threatReports.map((report: any) => (
              <Card key={report.reportId} className="border-destructive">
                <CardHeader className="bg-destructive/10">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {report.type.toUpperCase()} Threat Detection
                    {report.status === 'active' && (
                      <span className="ml-auto text-sm bg-destructive text-white px-2 py-1 rounded-md">
                        ACTIVE
                      </span>
                    )}
                    {report.status === 'resolved' && (
                      <span className="ml-auto text-sm bg-green-500 text-white px-2 py-1 rounded-md">
                        RESOLVED
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Detected:</p>
                      <p className="font-medium">
                        {format(new Date(report.detectionTime), "PPpp")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Signal Strength:</p>
                      <p className="font-medium">{report.signalStrength}%</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">Frequency Range:</p>
                    <p>{report.frequencyRange}</p>
                  </div>

                  {report.sourceAnalysis && (
                    <div className="border rounded-md p-3 mt-2 bg-muted/50">
                      <p className="font-medium mb-1">Attack Source Analysis</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {report.sourceAnalysis.direction && (
                          <div>
                            <span className="text-muted-foreground">Direction:</span> {report.sourceAnalysis.direction}
                          </div>
                        )}
                        {report.sourceAnalysis.distance && (
                          <div>
                            <span className="text-muted-foreground">Distance:</span> {report.sourceAnalysis.distance}
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Confidence:</span> {report.sourceAnalysis.confidence}%
                        </div>
                        {report.sourceAnalysis.possibleDeviceType && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Device:</span> {report.sourceAnalysis.possibleDeviceType}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Regular Reports Section */}
      <h2 className="text-2xl font-semibold mt-8">Frequency Reports</h2>
      <div className="grid gap-4">
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {report.frequency}Hz Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {format(new Date(report.timestamp), "PPpp")}
              </p>
              <p className="mt-2">{report.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
