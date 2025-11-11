import { useState, useEffect } from 'react';
import performanceMonitor from '../../utils/performanceMonitor';
import pollingService from '../../services/pollingService';

const PerformanceDebugger = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [report, setReport] = useState(null);
  const [pollingStatus, setPollingStatus] = useState({});

  useEffect(() => {
    // Only show in development
    if (!import.meta.env.DEV) return;

    // Listen for Ctrl+Shift+D to toggle debugger
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        if (!isVisible) {
          updateReport();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const updateReport = () => {
    setReport(performanceMonitor.getReport());
    setPollingStatus(pollingService.getStatus());
  };

  const clearData = () => {
    performanceMonitor.clear();
    updateReport();
  };

  const exportData = () => {
    performanceMonitor.export();
  };

  if (!import.meta.env.DEV || !isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '400px',
      maxHeight: '80vh',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 10000,
      overflow: 'auto',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, color: '#4CAF50' }}>🔍 Performance Debugger</h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={updateReport}
          style={{ 
            marginRight: '5px', 
            padding: '5px 10px', 
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Refresh
        </button>
        <button 
          onClick={clearData}
          style={{ 
            marginRight: '5px', 
            padding: '5px 10px', 
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Clear
        </button>
        <button 
          onClick={exportData}
          style={{ 
            padding: '5px 10px', 
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Export
        </button>
      </div>

      {/* Memory Info */}
      {performance.memory && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#FF9800' }}>Memory Usage</h4>
          <div>Used: {(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
          <div>Total: {(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
          <div>Limit: {(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</div>
        </div>
      )}

      {/* Polling Status */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', color: '#9C27B0' }}>Polling Services</h4>
        {Object.keys(pollingStatus).length === 0 ? (
          <div style={{ color: '#888' }}>No active polling</div>
        ) : (
          Object.entries(pollingStatus).map(([endpoint, status]) => (
            <div key={endpoint} style={{ marginBottom: '3px' }}>
              <div style={{ color: status.active ? '#4CAF50' : '#F44336' }}>
                {endpoint} ({status.subscribers} subscribers)
              </div>
            </div>
          ))
        )}
      </div>

      {/* API Calls */}
      {report && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#2196F3' }}>API Calls</h4>
          {Object.keys(report.apiCalls).length === 0 ? (
            <div style={{ color: '#888' }}>No API calls tracked</div>
          ) : (
            Object.entries(report.apiCalls)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 10)
              .map(([endpoint, stats]) => (
                <div key={endpoint} style={{ marginBottom: '3px' }}>
                  <div style={{ color: stats.errors > 0 ? '#F44336' : '#4CAF50' }}>
                    {endpoint}
                  </div>
                  <div style={{ fontSize: '10px', color: '#888', marginLeft: '10px' }}>
                    {stats.count} calls, avg {stats.avgDuration.toFixed(0)}ms
                    {stats.errors > 0 && `, ${stats.errors} errors`}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Recent Errors */}
      {report && report.errorLog.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#F44336' }}>Recent Errors</h4>
          {report.errorLog.slice(-5).reverse().map((error, index) => (
            <div key={index} style={{ marginBottom: '5px', padding: '5px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: '3px' }}>
              <div style={{ color: '#F44336', fontWeight: 'bold' }}>{error.type}</div>
              <div style={{ fontSize: '10px' }}>{error.message}</div>
              <div style={{ fontSize: '9px', color: '#888' }}>
                {new Date(error.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: '10px', color: '#888', textAlign: 'center', marginTop: '10px' }}>
        Press Ctrl+Shift+D to toggle
      </div>
    </div>
  );
};

export default PerformanceDebugger;
