// import { Trans, useTranslation } from 'react-i18next';
// import './home.css';
// import useDocumentTitle from '../common/use-document-title';
// import { useState } from 'react';
// import axios from 'axios';


// export default function Home() {
//   const { t } = useTranslation();
//   useDocumentTitle(t('home.index.headline'));

//   const [name, setName] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleGreeting = async () => {
//     if (!name) {
//       return;
//     }
//     setLoading(true);
//     setMessage('');
//     try {
//       const response = await axios.get('/hello', { params: { param: name } });
//       setMessage(response.data);
//     } catch (error) {
//       setMessage('Error fetching the greeting.');
//       console.error('API call failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (<>
//     <h1 className="grow text-3xl md:text-4xl text-red-500 font-medium mb-8">{t('home.index.headline')}</h1>
//     <p className="mb-4"><Trans i18nKey="home.index.text" components={{ a: <a />, strong: <strong /> }} /></p>
//     <p className="mb-12">
//       <span>{t('home.index.swagger.text')}</span>
//       <span> </span>
//       <a href={import.meta.env.VITE_API_PATH + '/swagger-ui.html'} target="_blank" className="underline">{t('home.index.swagger.link')}</a>.
//     </p>

//     <div className="border-t pt-8 mt-8">
//       <h2 className="text-2xl font-medium mb-4">Say Hello</h2>
//       <div className="flex items-center gap-4">
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Enter your name"
//           className="input-primary"
//           aria-label="Your name"
//           />
//         <button
//           onClick={handleGreeting}
//           disabled={loading}
//           className="btn-primary"
//           >
//           {loading ? 'Sending...' : 'Send'}
//         </button>
//       </div>
//       {message && (
//         <div className="mt-4 p-4 bg-gray-100 border rounded-md">
//           <p className="text-gray-800">{message}</p>
//         </div>
//       )}
//     </div>
//   </>);
// }