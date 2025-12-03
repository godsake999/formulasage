'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkFormulaUpload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ total: number; success: number; failed: number } | null>(null);
  const [errorLog, setErrorLog] = useState<string[]>([]);

  // Helper to map difficulty English input to DB structure
  const getDifficultyMy = (diffEn: string) => {
    const map: Record<string, string> = {
      'Beginner': 'လွယ်ကူသော',
      'Intermediate': 'အလယ်အလတ်',
      'Advanced': 'ခက်ခဲသော'
    };
    return map[diffEn] || 'လွယ်ကူသော'; // Default fallback
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStats(null);
    setErrorLog([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        let successCount = 0;
        let updateCount = 0; // Track updates vs inserts
        let failCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          
          // 1. Basic Validation
          if (!row['Title (EN)'] || !row['Syntax']) {
            failCount++;
            errors.push(`Row ${i + 1}: Missing Title or Syntax`);
            continue;
          }

          // 2. Prepare the data object
          const formulaData = {
            title_en: row['Title (EN)'],
            title_my: row['Title (MY)'],
            category_en: row['Category (EN)'],
            category_my: row['Category (MY)'],
            difficulty_en: row['Difficulty'],
            difficulty_my: getDifficultyMy(row['Difficulty']),
            short_description_en: row['Short Desc (EN)'],
            short_description_my: row['Short Desc (MY)'],
            long_description_en: row['Long Desc (EN)']?.split('\n') || [],
            long_description_my: row['Long Desc (MY)']?.split('\n') || [],
            syntax: row['Syntax'],
            syntax_breakdown_en: row['Syntax Breakdown (EN)']?.split('\n') || [],
            syntax_breakdown_my: row['Syntax Breakdown (MY)']?.split('\n') || [],

            example: row['Example Code'] || '', // Fills the required legacy column

            examples: [
              {
                code: row['Example Code'],
                explanation: {
                  en: row['Example Exp (EN)'],
                  my: row['Example Exp (MY)']
                },
                imageUrl: "" 
              }
            ],

          };

          try {
            // 3. CHECK: Does this formula exist?
            // We use .ilike for case-insensitive match (e.g., "sum" matches "SUM")
            const { data: existing } = await supabase
              .from('formulas')
              .select('id')
              .ilike('title_en', row['Title (EN)'])
              .maybeSingle();

            let error;

            if (existing) {
              // UPDATE existing record
              const result = await supabase
                .from('formulas')
                .update(formulaData)
                .eq('id', existing.id);
              error = result.error;
              if (!error) updateCount++;
            } else {
              // INSERT new record
              const result = await supabase
                .from('formulas')
                .insert(formulaData);
              error = result.error;
              if (!error) successCount++;
            }

            if (error) throw error;

          } catch (err: any) {
            console.error("Detailed Upload Error:", err);
            failCount++;
            
            // FIX: Check for 'message' directly, as Supabase errors are not 'Error' instances
            const message = err.message || (typeof err === 'string' ? err : JSON.stringify(err));
            
            errors.push(`Row ${i + 1} (${row['Title (EN)']}): ${message}`);
          }
        }

        // Update stats to show updates vs inserts
        setStats({ total: rows.length, success: successCount + updateCount, failed: failCount });
        setErrorLog(errors);
        setLoading(false);
        if (successCount + updateCount > 0) onUploadComplete();
      }
    });
  };

  return (
    <Card className="mt-8 border-dashed border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          Bulk Upload Formulas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input 
            type="file" 
            accept=".csv"
            onChange={handleFileUpload}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Upload a CSV file. <a href="/template.csv" download className="underline text-primary">Download Template</a>
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing file...
          </div>
        )}

        {stats && (
          <div className="space-y-2">
            <Alert variant={stats.failed === 0 ? "default" : "destructive"}>
              {stats.failed === 0 ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>Upload Complete</AlertTitle>
              <AlertDescription>
                Processed {stats.total} rows. {stats.success} successful, {stats.failed} failed.
              </AlertDescription>
            </Alert>
            
            {errorLog.length > 0 && (
              <div className="bg-muted p-2 rounded-md text-xs font-mono max-h-32 overflow-y-auto">
                {errorLog.map((err, idx) => <div key={idx} className="text-red-500">{err}</div>)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}