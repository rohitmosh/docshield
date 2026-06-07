import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { File } from '../../types';

export const SearchConsole: React.FC = () => {
  const { apiRequest } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [parsedQueryText, setParsedQueryText] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const data = await apiRequest('/documents/vault?all=true');
        setFiles(data.files || []);
      } catch (e) {
        console.error('Error loading documents for search console:', e);
      }
    };
    loadFiles();
  }, [apiRequest]);

  const executeBooleanSearch = (query: string, doc: File): { matches: boolean; evalStr: string } => {
    let q = query.toLowerCase().trim();
    const searchContent = `${doc.name} ${doc.category} ${doc.department} ${doc.ocr_text} ${doc.tags.join(" ")}`.toLowerCase();

    // 1. Wildcard Check
    if (q.includes('*')) {
      const parts = q.split('*');
      const regexStr = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
      const rx = new RegExp(regexStr);
      return {
        matches: rx.test(searchContent),
        evalStr: `regex(/${regexStr}/)`
      };
    }

    // 2. Boolean parsing (AND, OR, NOT)
    if (q.includes(' and ') || q.includes(' or ') || q.includes(' not ') || q.startsWith('not ')) {
      let evalStr = q;
      const wordRegex = /[a-z0-9]+/g;
      let match;
      const replacements: Array<{ word: string; start: number; end: number }> = [];
      
      while ((match = wordRegex.exec(q)) !== null) {
        const word = match[0];
        if (word !== 'and' && word !== 'or' && word !== 'not') {
          replacements.push({
            word,
            start: match.index,
            end: match.index + word.length
          });
        }
      }

      // Replace from end to keep indexes valid
      replacements.sort((a, b) => b.start - a.start).forEach(rep => {
        const check = `searchContent.includes('${rep.word}')`;
        evalStr = evalStr.substring(0, rep.start) + check + evalStr.substring(rep.end);
      });

      evalStr = evalStr.replace(/\band\b/g, '&&')
                       .replace(/\bor\b/g, '||')
                       .replace(/\bnot\b/g, '&& !');
                       
      evalStr = evalStr.replace(/&&\s*&&/g, '&&')
                       .replace(/\|\|\s*&&/g, '||')
                       .replace(/^\s*&&\s*/g, '');

      try {
        const fn = new Function('searchContent', `return (${evalStr});`);
        return {
          matches: fn(searchContent),
          evalStr
        };
      } catch (e) {
        const fallbackWord = q.replace(/(and|or|not)/g, '').trim();
        return {
          matches: searchContent.includes(fallbackWord),
          evalStr: `fallback(includes('${fallbackWord}'))`
        };
      }
    }

    // 3. Simple text fallback
    return {
      matches: searchContent.includes(q),
      evalStr: `searchContent.includes('${q}')`
    };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setResults([]);
      setParsedQueryText('');
      setHasSearched(false);
      return;
    }

    // Execute search
    const matchedFiles: File[] = [];
    let queryRepresentationText = '';

    files.forEach(doc => {
      const searchResult = executeBooleanSearch(searchQuery, doc);
      if (searchResult.matches) {
        matchedFiles.push(doc);
      }
      queryRepresentationText = searchResult.evalStr;
    });

    setResults(matchedFiles);
    setParsedQueryText(queryRepresentationText);
    setHasSearched(true);
  };

  const getFileSnippet = (doc: File, query: string) => {
    let snippet = '...';
    if (query) {
      const cleanTerms = query.replace(/(AND|OR|NOT)/g, '').replace(/[*]/g, '').split(/\s+/).filter(t => t.trim().length > 2);
      const foundText = doc.ocr_text;
      
      let matched = false;
      cleanTerms.forEach(term => {
        const idx = foundText.toLowerCase().indexOf(term.toLowerCase());
        if (idx !== -1 && !matched) {
          matched = true;
          let sub = foundText.substring(Math.max(0, idx - 45), Math.min(foundText.length, idx + 85));
          
          // Escape HTML characters to prevent XSS before wrapping in mark
          let escapedSub = sub
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          // Safely apply highlights using regex replace
          const regexTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${regexTerm})`, 'gi');
          escapedSub = escapedSub.replace(regex, '<mark style="background: rgba(245, 158, 11, 0.3); font-weight: 700; border-radius: 2px; padding: 1px 2px;">$1</mark>');
          snippet = '...' + escapedSub.trim() + '...';
        }
      });
      
      if (!matched) {
        snippet = doc.ocr_text.substring(0, 90) + '...';
      }
    } else {
      snippet = doc.ocr_text.substring(0, 90) + '...';
    }
    return <span dangerouslySetInnerHTML={{ __html: snippet }} />;
  };

  const getFileIcon = (type: string) => {
    let color = '#3B82F6';
    if (type === 'PDF') color = '#EF4444';
    if (type === 'DOCX') color = '#2563EB';
    if (type === 'XLSX') color = '#10B981';

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', flexShrink: 0 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  };

  return (
    <div className="search-view" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Search Console Input Block */}
      <div className="section-card">
        <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem', fontSize: '1.25rem' }}>Secure OCR Logical Search Engine</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Query plant design drawings, hydro schemas, PPAs, and HR charts. The search engine executes real-time logical parsing of boolean clauses (<code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>AND</code>, <code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>OR</code>, <code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>NOT</code>) and wildcard strings (<code style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>*</code>) over index logs.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="search-input-wrapper" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0 1rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              className="search-input" 
              style={{ border: 'none', background: 'none', width: '100%', outline: 'none', padding: '0.75rem 0', fontSize: '0.95rem' }} 
              placeholder="e.g. turbine AND overhaul NOT generator"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0 2rem', fontWeight: 700 }}>Search Records</button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div><strong>Logical operators:</strong> Clause groups must be separated by capitalized logical keywords: <code style={{ color: 'var(--primary-blue)' }}>AND</code>, <code style={{ color: 'var(--primary-blue)' }}>OR</code>, <code style={{ color: 'var(--primary-blue)' }}>NOT</code></div>
          <div><strong>Wildcards:</strong> Matches suffixes/prefixes, e.g. <code style={{ color: 'var(--primary-blue)' }}>balimela*</code> or <code style={{ color: 'var(--primary-blue)' }}>*tender</code></div>
        </div>
      </div>

      {/* Compiler pipeline logs */}
      {parsedQueryText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F8FAFC', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>Logical AST Evaluation Schema:</span>
          <code style={{ background: '#E2E8F0', padding: '2px 6px', borderRadius: '4px', color: 'var(--navy)' }}>{parsedQueryText}</code>
        </div>
      )}

      {/* Query Results Section */}
      {hasSearched && (
        <div className="section-card">
          <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.1rem', margin: 0 }}>Query Results ({results.length} matching entries)</h4>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Resource Name</th>
                  <th>Classification</th>
                  <th>Department</th>
                  <th>Match Context (OCR Snippet)</th>
                  <th>Last Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" style={{ marginBottom: '1rem' }}><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      <p style={{ fontWeight: 600 }}>No files matched your boolean criteria</p>
                    </td>
                  </tr>
                ) : (
                  results.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div className="doc-name-cell" style={{ display: 'flex', alignItems: 'center' }}>
                          {getFileIcon(doc.type)}
                          <a href={`#document-viewer?id=${doc.id}`} style={{ fontWeight: 600, color: 'var(--navy)', textDecoration: 'none' }}>{doc.name}</a>
                        </div>
                      </td>
                      <td><span className={`badge-classification ${doc.classification.toLowerCase()}`}>{doc.classification}</span></td>
                      <td><span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.department}</span></td>
                      <td>
                        <div style={{ maxWidth: '380px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          {getFileSnippet(doc, searchQuery)}
                        </div>
                      </td>
                      <td>{new Date(doc.modified_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <a href={`#document-viewer?id=${doc.id}`} className="btn-text-action" style={{ textDecoration: 'none' }}>View Record</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchConsole;
