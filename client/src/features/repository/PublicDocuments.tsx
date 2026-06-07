import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { File } from '../../types';

export const PublicDocuments: React.FC = () => {
  const { apiRequest } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<File[]>([]);
  
  // State for filters
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      const data = await apiRequest('/documents/vault?all=true');
      const allFiles = data.files || [];
      // Only keep PUBLIC and published documents
      const publicFiles = allFiles.filter((f: File) => f.classification === 'PUBLIC' && f.status === 'published');
      setFiles(publicFiles);
      setFilteredFiles(publicFiles);
    } catch (e) {
      console.error('Error fetching public documents:', e);
    }
  }, [apiRequest]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Apply filters on client-side
  const applyFilters = useCallback(() => {
    const query = searchQuery.trim().toLowerCase();
    
    const result = files.filter(doc => {
      // Department Filter
      if (selectedDept !== 'ALL' && doc.department !== selectedDept) return false;
      
      // Type/Format Filter
      if (selectedType !== 'ALL' && doc.type !== selectedType) return false;
      
      // Category Filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(doc.category)) return false;
      
      // Year filter
      if (selectedYear !== 'ALL') {
        const docYear = new Date(doc.modified_time).getFullYear().toString();
        if (docYear !== selectedYear) return false;
      }

      // Search Query Filter
      if (query) {
        const titleMatch = doc.name.toLowerCase().includes(query);
        const tagMatch = doc.tags.some(t => t.toLowerCase().includes(query));
        const textMatch = doc.ocr_text.toLowerCase().includes(query);
        return titleMatch || tagMatch || textMatch;
      }

      return true;
    });

    setFilteredFiles(result);
  }, [files, selectedDept, selectedType, selectedYear, selectedCategories, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  const handleDownload = async (doc: File) => {
    try {
      const response = await apiRequest(`/documents/${doc.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="public-docs-layout" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
      {/* Sidebar Filters */}
      <aside className="filters-sidebar">
        <div className="filters-title">
          <span>Filter Records</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        </div>
        
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-public-dept">Department</label>
          <select 
            id="filter-public-dept" 
            className="filter-select"
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
          >
            <option value="ALL">All Departments</option>
            <option value="Generation">Generation</option>
            <option value="Transmission">Transmission</option>
            <option value="Finance">Finance & Accounts</option>
            <option value="HR">Human Resources</option>
            <option value="IT">IT Infrastructure</option>
            <option value="Legal">Legal & Contracts</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-public-type">Document Type</label>
          <select 
            id="filter-public-type" 
            className="filter-select"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="ALL">All Formats</option>
            <option value="PDF">PDF Document</option>
            <option value="DOCX">Word Document</option>
            <option value="XLSX">Excel Sheet</option>
            <option value="IMAGE">Image Assets</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-public-year">Year Published</label>
          <select 
            id="filter-public-year" 
            className="filter-select"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="ALL">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Category</label>
          <div className="filter-checkbox-list" id="filter-public-category-list">
            {['Technical', 'Administrative', 'Financial', 'Regulatory', 'Legal'].map(cat => (
              <label key={cat} className="checkbox-label">
                <input 
                  type="checkbox" 
                  value={cat} 
                  checked={selectedCategories.includes(cat)}
                  onChange={e => handleCategoryChange(cat, e.target.checked)}
                />
                <span> {cat}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Listing Area */}
      <div className="docs-main">
        <div className="search-bar-row">
          <div className="search-input-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              id="search-public-input" 
              className="search-input" 
              placeholder="Search by name, tags, or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button id="btn-public-search" className="btn-search" onClick={applyFilters}>Search</button>
        </div>

        <div className="docs-grid" id="public-docs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          {filteredFiles.length === 0 ? (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" style={{ marginBottom: '1rem' }}><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <p style={{ fontWeight: 600 }}>No matching public records found</p>
            </div>
          ) : (
            filteredFiles.map(doc => {
              const formattedDate = new Date(doc.modified_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              return (
                <div key={doc.id} className="doc-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '240px' }}>
                  <div>
                    <div className="doc-card-header">
                      <span className="badge-classification public">Public</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{doc.type} ({formatBytes(doc.size)})</span>
                    </div>
                    <h4 className="doc-card-title">{doc.name}</h4>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="doc-card-info">
                      <div className="doc-card-info-item">
                        <strong>Dept:</strong> <span>{doc.department}</span>
                      </div>
                      <div className="doc-card-info-item">
                        <strong>Date:</strong> <span>{formattedDate}</span>
                      </div>
                    </div>
                    <div className="metadata-tags">
                      {doc.tags.map(t => (
                        <span key={t} className="metadata-tag">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="doc-card-actions">
                    <a href={`#document-viewer?id=${doc.id}`} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      View Record
                    </a>
                    <button className="btn-primary" onClick={() => handleDownload(doc)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', color: 'var(--primary-blue)', border: '1px solid var(--primary-blue)', boxShadow: 'none' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicDocuments;
