import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Prompt History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <div className="flex border-b mb-4">
            <button onClick={() => setActiveTab('All')} className={`px-4 py-2 ${activeTab === 'All' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>All</button>
            <button onClick={() => setActiveTab('Favorites')} className={`px-4 py-2 ${activeTab === 'Favorites' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>Favorites</button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredPrompts.map(prompt => (
              <div key={prompt.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-2">
                  <label className="font-semibold text-sm">System Prompt:</label>
                  <p className="text-gray-700 bg-white p-2 rounded mt-1">{prompt.systemPrompt}</p>
                </div>
                <div className="mb-4">
                  <label className="font-semibold text-sm">User Prompt:</label>
                  <p className="text-gray-700 bg-white p-2 rounded mt-1">{prompt.userPrompt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUsePrompt(prompt)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-1 px-3 rounded-md">Use this Prompt</button>
                  <button onClick={() => onToggleFavorite(prompt.id)} className={`p-2 rounded-md border ${prompt.isFavorite ? 'text-yellow-500 border-yellow-400 bg-yellow-50' : 'text-gray-400 border-gray-300'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </button>
                  <button onClick={() => onDeletePrompt(prompt.id)} className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
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

const Section = ({ title, subtitle, children, onHistoryClick }: { title: string, subtitle?: string, children: React.ReactNode, onHistoryClick?: () => void }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
    <div className="flex justify-between items-center">
        <div>
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {title === 'Prompts' && <button type="button" onClick={onHistoryClick} className="text-sm font-medium text-gray-600 hover:text-gray-900">History</button>}
    </div>
    <div className="mt-6">{children}</div>
  </div>
);

const FormInput = ({ name, label }: { name: keyof AnalyzerFormValues, label: string }) => {
  const { register } = useFormContext<AnalyzerFormValues>();
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input id={name} {...register(name)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
  );
};

const FormTextarea = ({ name, label, rows = 3 }: { name: keyof AnalyzerFormValues, label: string, rows?: number }) => {
  const { register } = useFormContext<AnalyzerFormValues>();
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea id={name} {...register(name)} rows={rows} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
  );
};

const FormSelect = ({ name, label, options }: { name: keyof AnalyzerFormValues, label: string, options: readonly string[] }) => {
  const { register } = useFormContext<AnalyzerFormValues>();
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select id={name} {...register(name)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
};

const FormSlider = ({ name, label, min, max, step }: { name: keyof AnalyzerFormValues, label: string, min: number, max: number, step: number }) => {
  const { control, watch } = useFormContext<AnalyzerFormValues>();
  const value = watch(name);
  return (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <span className="text-sm text-gray-600 w-10 text-right">{value}</span>
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
            <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
            <Controller
                name={name}
                control={control}
                render={({ field: { onChange, value } }) => (
                    <button
                        type="button"
                        onClick={() => onChange(!value)}
                        className={`${value ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
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
            <Section title="Prompts" subtitle="Provide the system and user prompts for the model." onHistoryClick={() => setIsHistoryModalOpen(true)}>
              <FormTextarea name="systemPrompt" label="System Prompt" rows={4} />
              <FormTextarea name="userPrompt" label="User Prompt" rows={6} />
            </Section>

            <Section title="Attachments">
                <div className="flex justify-center items-center w-full">
                    <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">Up to 5 files, 10MB each</p>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Analysis Results" subtitle="The model's performance analysis will appear here.">
              {isLoading ? (
                <p>Analyzing...</p>
              ) : analysisResult ? (
                <div className="p-4 bg-gray-50 rounded-md">{analysisResult}</div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Ready to Analyze</p>
                  <p className="text-sm text-gray-400">Fill out the form and click "Analyze" to see the results.</p>
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
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
            {isLoading ? 'Analyzing...' : 'Analyze Performance'}
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
