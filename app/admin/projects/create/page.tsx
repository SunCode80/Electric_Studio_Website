'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileJson, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createProject } from '@/lib/api/projects';
import { toast } from 'sonner';

export default function CreateProjectPage() {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [surveyFile, setSurveyFile] = useState<File | null>(null);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setError('');

    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (typeof data !== 'object' || Array.isArray(data)) {
        setError('Invalid JSON structure. Expected an object.');
        return;
      }

      setSurveyFile(file);
      setSurveyData(data);

      const company = data.companyName || data.company_name || data.company || data.clientName || data.client_name || data.client || data.businessName || data.business_name || '';

      if (company) {
        setClientName(company);
        setProjectName(`${company} Content Strategy`);
        toast.success('Project details auto-filled from survey data');
      }
    } catch (err) {
      setError('Failed to parse JSON file. Please check the file format.');
    }
  };

  const handleRemoveFile = () => {
    setSurveyFile(null);
    setSurveyData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!projectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    if (!clientName.trim()) {
      setError('Please enter a client name');
      return;
    }

    if (!surveyData) {
      setError('Please upload a survey file');
      return;
    }

    setIsSubmitting(true);

    try {
      const { project, error: createError } = await createProject(
        projectName,
        clientName,
        surveyData
      );

      if (createError || !project) {
        throw new Error(createError || 'Failed to create project');
      }

      toast.success('Project created successfully!');
      router.push(`/admin/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to create project');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-2 text-gray-600">
          Upload a survey JSON file to start a new production pipeline
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Basic details about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Acme Corp Content Strategy"
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g., Acme Corporation"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Survey Data</CardTitle>
              <CardDescription>
                Upload the S1 survey JSON file
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!surveyFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your JSON file here, or
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    Supports: JSON files only
                  </p>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileJson className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{surveyFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(surveyFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
