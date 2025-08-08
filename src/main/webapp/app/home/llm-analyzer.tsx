import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import { Book, BotMessageSquare, ChevronDown, FileUp, Star, Trash2 } from 'lucide-react';

type PromptHistory = {
  id: number;
  systemPrompt: string;
  userPrompt: string;
  isFavorite: boolean;
};

const mockHistory: PromptHistory[] = [
  { id: 1, systemPrompt: 'You are a helpful assistant.', userPrompt: 'Write a story about a robot who discovers music.', isFavorite: true },
  { id: 2, systemPrompt: 'You are a helpful assistant.', userPrompt: 'Write a story about a RBD who discovers music.', isFavorite: false },
];

const llmProviders = ['OpenAI', 'Azure OpenAI', 'Google Gemini'] as const;
const models = {
  OpenAI: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  'Azure OpenAI': ['azure-gpt-4-turbo', 'azure-gpt-4'],
  'Google Gemini': ['gemini-pro', 'gemini-1.5-pro'],
};

const analyzerSchema = yup.object({
  systemPrompt: yup.string().default('You are a helpful assistant.'),
  userPrompt: yup.string().default('Write a story about a robot who discovers music.'),
  llmProvider: yup.string().oneOf(llmProviders).default('OpenAI'),
  baseUrl: yup.string().url().default('https://api.example.com/v1'),
  modelSelection: yup.string().default('gpt-4-turbo'),
  temperature: yup.number().min(0).max(2).default(0.7),
  topK: yup.number().integer().min(1).default(40),
  topP: yup.number().min(0).max(1).default(0.9),
  maxTokens: yup.number().integer().min(1).default(2048),
  thinkingMode: yup.string().default('Synchronous'),
  structuredOutput: yup.boolean().default(false),
  codeExecution: yup.boolean().default(false),
  functionCalling: yup.boolean().default(false),
}).required();

type AnalyzerFormValues = yup.InferType<typeof analyzerSchema>;

const PromptHistoryModal = ({
  isOpen,
  onClose,
  onUsePrompt,
  onToggleFavorite,
  onDeletePrompt,
  prompts,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt: (prompt: PromptHistory) => void;
  onToggleFavorite: (id: number) => void;
  onDeletePrompt: (id: number) => void;
  prompts: PromptHistory[];
}) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Favorites'>('All');

  if (!isOpen) return null;

  const filteredPrompts = activeTab === 'Favorites' ? prompts.filter(p => p.isFavorite) : prompts;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Book className="h-5 w-5" /> Prompt History</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <div className="flex border-b mb-4">
            <button onClick={() => setActiveTab('All')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'All' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
            <button onClick={() => setActiveTab('Favorites')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'Favorites' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Favorites</button>
          </div>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            {filteredPrompts.map(prompt => (
              <div key={prompt.id} className="border rounded-lg p-4 bg-background hover:border-primary/50 transition-all">
                <div className="mb-2">
                  <label className="font-semibold text-sm">System Prompt:</label>
                  <p className="text-muted-foreground bg-muted/50 p-2 rounded mt-1 text-sm">{prompt.systemPrompt}</p>
                </div>
                <div className="mb-4">
                  <label className="font-semibold text-sm">User Prompt:</label>
                  <p className="text-muted-foreground bg-muted/50 p-2 rounded mt-1 text-sm">{prompt.userPrompt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUsePrompt(prompt)} className="bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold py-1 px-3 rounded-md transition-colors">Use this Prompt</button>
                  <button onClick={() => onToggleFavorite(prompt.id)} className={`p-2 rounded-md border transition-colors ${prompt.isFavorite ? 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20' : 'text-muted-foreground border-border hover:bg-accent'}`}>
                    <Star className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDeletePrompt(prompt.id)} className="p-2 rounded-md bg-destructive/80 text-destructive-foreground hover:bg-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, subtitle, children, onHistoryClick, icon }: { title: string, subtitle?: string, children: React.ReactNode, onHistoryClick?: () => void, icon?: React.ReactNode }) => (
  <div className="bg-card border rounded-lg p-6 mb-6 transition-shadow hover:shadow-md">
    <div className="flex justify-between items-start">
        <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">{icon}{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {title === 'Prompts' && <button type="button" onClick={onHistoryClick} className="text-sm font-medium text-primary hover:underline flex items-center gap-1"><Book className="h-4 w-4" /> History</button>}
    </div>
    <div className="mt-6">{children}</div>
  </div>
);

const FormInput = ({ name, label }: { name: keyof AnalyzerFormValues, label: string }) => {
  const { register } = useFormContext<AnalyzerFormValues>();
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      <input id={name} {...register(name)} className="w-full p-2 border bg-transparent rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors" />
    </div>
  );
};

const FormTextarea = ({ name, label, rows = 3 }: { name: keyof AnalyzerFormValues, label: string, rows?: number }) => {
  const { register } = useFormContext<AnalyzerFormValues>();
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      <textarea id={name} {...register(name)} rows={rows} className="w-full p-2 border bg-transparent rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors" />
    </div>
  );
};

const FormSelect = ({ name, label, options }: { name: keyof AnalyzerFormValues, label: string, options: readonly string[] }) => {
  const { register } = useFormContext<AnalyzerFormValues>();
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      <div className="relative">
        <select id={name} {...register(name)} className="w-full p-2 border bg-transparent rounded-md shadow-sm focus:ring-primary focus:border-primary transition-colors appearance-none">
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
      </div>
    </div>
  );
};

const FormSlider = ({ name, label, min, max, step }: { name: keyof AnalyzerFormValues, label: string, min: number, max: number, step: number }) => {
  const { control, watch } = useFormContext<AnalyzerFormValues>();
  const value = watch(name);
  return (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <label htmlFor={name} className="block text-sm font-medium text-muted-foreground">{label}</label>
            <span className="text-sm text-foreground w-10 text-right">{value}</span>
        </div>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              value={Number(field.value)}
              type="range"
              min={min}
              max={max}
              step={step}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          )}
        />
    </div>
  );
};

const FormToggle = ({ name, label }: { name: keyof AnalyzerFormValues, label: string }) => {
    const { control } = useFormContext<AnalyzerFormValues>();
    return (
        <div className="flex items-center justify-between mb-4">
            <label htmlFor={name} className="text-sm font-medium text-muted-foreground">{label}</label>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => (
                    <button
                        type="button"
                        onClick={() => onChange(!value)}
                        className={`${value ? 'bg-primary' : 'bg-muted'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
                        role="switch"
                        aria-checked={!!value}
                    >
                        <span className={`${value ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                    </button>
                )}
            />
        </div>
    );
};


export default function LlmAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>(mockHistory);

  const methods = useForm<AnalyzerFormValues>({
    resolver: yupResolver(analyzerSchema),
    defaultValues: analyzerSchema.getDefault(),
  });

  const { handleSubmit, watch, setValue } = methods;
  const selectedProvider = watch('llmProvider') ?? 'OpenAI';

  const onSubmit = async (data: AnalyzerFormValues) => {
    setIsLoading(true);
    setAnalysisResult(null);
    console.log(data);
    // Mock API call to your backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalysisResult('Analysis complete. The model performed as expected.');
    setIsLoading(false);
  };

  const handleUsePrompt = (prompt: PromptHistory) => {
    setValue('systemPrompt', prompt.systemPrompt);
    setValue('userPrompt', prompt.userPrompt);
    setIsHistoryModalOpen(false);
  };

  const handleToggleFavorite = (id: number) => {
    setPromptHistory(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const handleDeletePrompt = (id: number) => {
    setPromptHistory(prev => prev.filter(p => p.id !== id));
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-grow lg:w-2/3">
            <Section title="Prompts" subtitle="Provide the system and user prompts for the model." onHistoryClick={() => setIsHistoryModalOpen(true)} icon={<BotMessageSquare className="h-5 w-5" />}>
              <FormTextarea name="systemPrompt" label="System Prompt" rows={4} />
              <FormTextarea name="userPrompt" label="User Prompt" rows={6} />
            </Section>

            <Section title="Attachments" icon={<FileUp className="h-5 w-5" />}>
                <div className="flex justify-center items-center w-full">
                    <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-accent transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">Up to 5 files, 10MB each</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Analysis Results" subtitle="The model's performance analysis will appear here." icon={<BotMessageSquare className="h-5 w-5" />}>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="ml-4">Analyzing...</p>
                </div>
              ) : analysisResult ? (
                <div className="p-4 bg-muted/50 rounded-md text-sm">{analysisResult}</div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Ready to Analyze</p>
                  <p className="text-sm text-muted-foreground/70">Fill out the form and click "Analyze" to see the results.</p>
                </div>
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <Section title="Model Configuration" subtitle="Set the model endpoint and identifier.">
              <FormSelect name="llmProvider" label="LLM Provider" options={llmProviders} />
              <FormInput name="baseUrl" label="Base URL" />
              <FormSelect name="modelSelection" label="Model Selection" options={models[selectedProvider] || []} />
            </Section>

            <Section title="Parameters" subtitle="Adjust the model's generation parameters.">
              <FormSlider name="temperature" label="Temperature" min={0} max={2} step={0.1} />
              <FormSlider name="topK" label="Top K" min={1} max={100} step={1} />
              <FormSlider name="topP" label="Top P" min={0} max={1} step={0.05} />
              <FormInput name="maxTokens" label="Max Tokens" />
            </Section>

            <Section title="Advanced Settings">
                <FormSelect name="thinkingMode" label="Thinking Mode" options={['Synchronous', 'Asynchronous']} />
                <div className="border-t my-6" />
                <FormToggle name="structuredOutput" label="Structured Output" />
                <FormToggle name="codeExecution" label="Code Execution" />
                <FormToggle name="functionCalling" label="Function Calling" />
            </Section>
          </div>
        </div>

        <div className="mt-8">
          <button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:bg-primary/50 transition-colors flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              'Analyze Performance'
            )}
          </button>
        </div>
      </form>
      <PromptHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        prompts={promptHistory}
        onUsePrompt={handleUsePrompt}
        onToggleFavorite={handleToggleFavorite}
        onDeletePrompt={handleDeletePrompt}
      />
    </FormProvider>
  );
}
