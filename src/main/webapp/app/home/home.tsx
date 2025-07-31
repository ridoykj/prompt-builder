import useDocumentTitle from '../common/use-document-title';
import LlmAnalyzer from './llm-analyzer';
import './home.css';

export default function Home() {
  useDocumentTitle('LLM Analyzer');

  return (
    <div className="bg-gray-50 min-h-screen -m-12">
        <div className="container mx-auto px-4 md:px-6 py-8">
            <LlmAnalyzer />
        </div>
    </div>
  );
}