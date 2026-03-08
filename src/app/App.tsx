import React, { useState } from 'react';
import { I18nProvider } from '../i18n';
import Layout from './Layout';
import { HomePage } from '../features/home';
import { EditorPage } from '../features/editor';

type Page = 'home' | 'editor';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <I18nProvider>
      <Layout page={page} onNavigate={setPage}>
        {page === 'home' ? (
          <HomePage onGoEditor={() => setPage('editor')} />
        ) : (
          <EditorPage />
        )}
      </Layout>
    </I18nProvider>
  );
}
