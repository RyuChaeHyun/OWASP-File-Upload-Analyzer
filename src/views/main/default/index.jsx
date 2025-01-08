import React, { useState } from 'react';

// 유틸리티 함수들
const utils = {
  generateUUID: () => crypto.randomUUID(),
  formatBytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  getCurrentTimestamp: () => new Date().toISOString(),
  calculateSHA256: async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

// CWE 데이터베이스
const CWE_DATABASE = {
  'CWE-434': '신뢰되지 않은 파일 업로드',
  'CWE-73': '외부 파일 경로 조작',
  'CWE-200': '정보 노출',
  'CWE-400': '리소스 소진',
  'CWE-611': 'XXE 취약점',
  'CWE-915': '불충분한 MIME 타입 검증'
};

const FileSecurityPlatform = () => {
  const [selectedLib, setSelectedLib] = useState('multer');
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scanResults, setScanResults] = useState([]);
  const [packetLogs, setPacketLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [reportData, setReportData] = useState(null);

  // 테스트 대상 라이브러리 설정
const libraries = {
  // 1. 기본 업로드 라이브러리들
  multer: {
    name: 'Multer',
    version: '1.4.5-lts.1',
    type: 'upload',
    description: '멀티파트 폼 데이터 처리 라이브러리',
    settings: {
      dest: './uploads/',
      fileFilter: null,
      limits: { fileSize: 1000000 }
    },
    vulnerabilities: [
      {
        id: 'CVE-2023-1234',
        description: 'Path Traversal in fileFilter',
        severity: 'HIGH',
        cweId: 'CWE-73'
      }
    ]
  },

  expressFileUpload: {
    name: 'Express-FileUpload',
    version: '1.4.0',
    type: 'upload',
    description: 'Express.js 파일 업로드 미들웨어',
    settings: {
      createParentPath: true,
      safeFileNames: false,
      preserveExtension: true,
      debug: true
    },
    vulnerabilities: [
      {
        id: 'CVE-2023-5678',
        description: 'Directory Traversal via createParentPath',
        severity: 'CRITICAL',
        cweId: 'CWE-73'
      }
    ]
  },

  formidable: {
    name: 'Formidable',
    version: '3.5.1',
    type: 'upload',
    description: '파일 업로드 및 폼 파싱 라이브러리',
    settings: {
      keepExtensions: true,
      maxFileSize: Infinity,
      multiples: true,
      hashAlgorithm: 'sha1'
    },
    vulnerabilities: [
      {
        id: 'CVE-2023-9012',
        description: 'Unrestricted File Upload',
        severity: 'HIGH',
        cweId: 'CWE-434'
      }
    ]
  },

  busboy: {
    name: 'Busboy',
    version: '1.6.0',
    type: 'upload',
    description: '스트리밍 multipart 파서',
    settings: {
      limits: {
        fileSize: 10485760,
        files: 1,
        headerPairs: 2000
      },
      defCharset: 'utf8',
      preservePath: false
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-001',
        description: 'Stream Buffer Overflow',
        severity: 'MEDIUM',
        cweId: 'CWE-400'
      }
    ]
  },

  // 2. 다운로드 전용 라이브러리들
  sendFile: {
    name: 'Express Send File',
    version: '4.18.2',
    type: 'download',
    description: 'Express.js 파일 전송 라이브러리',
    settings: {
      root: './public',
      dotfiles: 'deny',
      headers: { 'x-timestamp': Date.now() }
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-002',
        description: 'Path Traversal in Root Directory',
        severity: 'HIGH',
        cweId: 'CWE-73'
      }
    ]
  },

  downloadFile: {
    name: 'Download',
    version: '8.0.0',
    type: 'download',
    description: '파일 다운로드 스트림 처리 라이브러리',
    settings: {
      timeout: 30000,
      retry: { retries: 3 },
      headers: {}
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-003',
        description: 'Unvalidated File Stream',
        severity: 'MEDIUM',
        cweId: 'CWE-494'
      }
    ]
  },

  // 3. 스트리밍 라이브러리들
  streamifier: {
    name: 'Streamifier',
    version: '0.1.1',
    type: 'stream',
    description: '버퍼를 스트림으로 변환',
    settings: {
      highWaterMark: 16384,
      encoding: 'utf8'
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-004',
        description: 'Memory Buffer Overflow',
        severity: 'HIGH',
        cweId: 'CWE-400'
      }
    ]
  },

  // 4. 클라우드 스토리지 라이브러리들
  awsS3: {
    name: 'AWS SDK S3',
    version: '3.410.0',
    type: 'cloud',
    description: 'AWS S3 파일 처리',
    settings: {
      region: 'ap-northeast-2',
      maxAttempts: 3,
      httpOptions: { timeout: 30000 }
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-005',
        description: 'Presigned URL Abuse',
        severity: 'HIGH',
        cweId: 'CWE-918'
      }
    ]
  },

  gcsStorage: {
    name: 'Google Cloud Storage',
    version: '7.0.0',
    type: 'cloud',
    description: 'Google Cloud Storage 파일 처리',
    settings: {
      projectId: 'project-id',
      keyFilename: 'key.json'
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-006',
        description: 'Signed URL Manipulation',
        severity: 'MEDIUM',
        cweId: 'CWE-287'
      }
    ]
  },

  // 5. 파일 처리 유틸리티
  sharp: {
    name: 'Sharp',
    version: '0.32.6',
    type: 'processing',
    description: '이미지 처리 라이브러리',
    settings: {
      failOnError: true,
      limitInputPixels: 268402689
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-007',
        description: 'Image Processing Memory Exhaustion',
        severity: 'MEDIUM',
        cweId: 'CWE-400'
      }
    ]
  },

  // 6. 대용량 파일 처리
  gridfs: {
    name: 'GridFS-Stream',
    version: '1.1.1',
    type: 'large-file',
    description: 'MongoDB GridFS 스트리밍',
    settings: {
      chunkSizeBytes: 261120,
      bucketName: 'fs'
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-008',
        description: 'Chunk Processing Overflow',
        severity: 'HIGH',
        cweId: 'CWE-400'
      }
    ]
  },

  // 7. 압축 파일 처리
  adm_zip: {
    name: 'ADM-ZIP',
    version: '0.5.10',
    type: 'compression',
    description: 'ZIP 파일 처리 라이브러리',
    settings: {
      keepOriginalPermissions: true,
      overwrite: true
    },
    vulnerabilities: [
      {
        id: 'VULN-2023-009',
        description: 'ZIP Slip Vulnerability',
        severity: 'CRITICAL',
        cweId: 'CWE-73'
      }
    ]
  }
};

  // 취약점 스캔 함수
  const performVulnerabilityScan = async (file, library) => {
    const vulnerabilities = [];
    
    // 파일 메타데이터 분석
    const fileHash = await utils.calculateSHA256(file);
    
    // MIME 타입 검증
    const mimeTypeCheck = {
      type: 'MIME Type Verification',
      description: '파일의 MIME 타입과 확장자 불일치',
      vulnerable: !file.type.match(file.name.split('.').pop()),
      severity: 'MEDIUM',
      cweId: 'CWE-915',
      details: `Declared MIME: ${file.type}`
    };
    if (mimeTypeCheck.vulnerable) vulnerabilities.push(mimeTypeCheck);

    // 파일명 검증
    const filenameCheck = {
      type: 'Filename Validation',
      description: '위험한 파일명 패턴 발견',
      vulnerable: /[;&|`<>]/.test(file.name),
      severity: 'HIGH',
      cweId: 'CWE-73',
      details: '특수문자가 포함된 파일명'
    };
    if (filenameCheck.vulnerable) vulnerabilities.push(filenameCheck);

    // 파일 크기 검증
    const sizeCheck = {
      type: 'File Size Validation',
      description: '비정상적인 파일 크기',
      vulnerable: file.size > 100 * 1024 * 1024,
      severity: 'MEDIUM',
      cweId: 'CWE-400',
      details: `File size: ${utils.formatBytes(file.size)}`
    };
    if (sizeCheck.vulnerable) vulnerabilities.push(sizeCheck);

    // 라이브러리 관련 취약점
    const libConfig = libraries[library];
    if (libConfig.vulnerabilities) {
      vulnerabilities.push(...libConfig.vulnerabilities);
    }

    return vulnerabilities;
  };

  // 패킷 모니터링
  const monitorPacket = (type, data) => {
    const packetLog = {
      id: utils.generateUUID(),
      timestamp: utils.getCurrentTimestamp(),
      type,
      headers: data.headers,
      body: data.body,
      size: data.size
    };
    setPacketLogs(prev => [...prev, packetLog]);
    logAuditEvent(`PACKET_${type.toUpperCase()}`, packetLog);
  };

  // 보안 감사 로깅
  const logAuditEvent = (eventType, details) => {
    const auditLog = {
      id: utils.generateUUID(),
      timestamp: utils.getCurrentTimestamp(),
      eventType,
      details,
      userId: 'admin',
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent
    };
    setAuditLogs(prev => [...prev, auditLog]);
  };

  // 취약점 리포트 생성
  const generateReport = (scanResults) => {
    const severityCounts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };

    scanResults.forEach(result => {
      if (result.severity) {
        severityCounts[result.severity]++;
      }
    });

    return {
      timestamp: utils.getCurrentTimestamp(),
      summary: {
        totalChecks: scanResults.length,
        vulnerabilitiesFound: scanResults.filter(r => r.vulnerable).length,
        severityCounts,
        overallRisk: calculateRiskLevel(severityCounts)
      },
      details: scanResults.map(result => ({
        type: result.type,
        description: result.description,
        severity: result.severity,
        cweId: result.cweId,
        details: result.details,
        recommendations: generateRecommendations(result)
      }))
    };
  };

  // 전체 위험도 계산
  const calculateRiskLevel = (severityCounts) => {
    const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const totalScore = Object.entries(severityCounts)
      .reduce((acc, [severity, count]) => acc + (weights[severity] * count), 0);
    const maxScore = Object.entries(severityCounts)
      .reduce((acc, [severity, count]) => acc + (4 * count), 0);
    
    const riskPercentage = (totalScore / maxScore) * 100;
    
    if (riskPercentage >= 75) return 'CRITICAL';
    if (riskPercentage >= 50) return 'HIGH';
    if (riskPercentage >= 25) return 'MEDIUM';
    return 'LOW';
  };

  // 권장사항 생성
  const generateRecommendations = (vulnerability) => {
    const recommendations = {
      'CWE-434': [
        '파일 업로드 전 상세 검증 구현',
        '허용된 파일 형식 화이트리스트 적용',
        '파일 콘텐츠 검증 추가'
      ],
      'CWE-73': [
        '경로 순회 문자 필터링',
        '안전한 파일명 생성',
        '업로드 디렉토리 제한'
      ],
      'CWE-200': [
        '에러 메시지 최소화',
        '중요 정보 로깅 제한',
        '디버그 정보 제거'
      ]
    };

    return recommendations[vulnerability.cweId] || ['일반적인 보안 강화 권장'];
  };

  // 파일 업로드 처리
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 감사 로깅
    logAuditEvent('FILE_UPLOAD_START', {
      filename: file.name,
      size: file.size,
      type: file.type
    });

    // 취약점 스캔
    const vulnerabilities = await performVulnerabilityScan(file, selectedLib);
    setScanResults(vulnerabilities);

    // 패킷 모니터링
    monitorPacket('upload', {
      headers: {
        'Content-Type': file.type,
        'Content-Length': file.size,
        'X-File-Name': file.name
      },
      body: 'FILE_CONTENT',
      size: file.size
    });

    // 파일 정보 저장
    const fileInfo = {
      id: utils.generateUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: utils.getCurrentTimestamp(),
      hash: await utils.calculateSHA256(file),
      library: selectedLib
    };
    setUploadedFiles(prev => [...prev, fileInfo]);

    // 리포트 생성
    const report = generateReport(vulnerabilities);
    setReportData(report);

    logAuditEvent('FILE_UPLOAD_COMPLETE', fileInfo);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg mt-12">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">File Library Security Assessment Platform</h2>
          <p className="mt-2 text-gray-600">파일 처리 라이브러리 취약점 분석 도구</p>
        </div>

        <div className="p-6">
          {/* 탭 메뉴 */}
          <div className="flex border-b border-gray-200 mb-6">
            {['upload', 'results', 'packets', 'audit', 'report'].map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* 업로드 탭 */}
          {activeTab === 'upload' && (
            <div>
              {/* 라이브러리 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  테스트할 라이브러리 선택
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedLib}
                  onChange={(e) => setSelectedLib(e.target.value)}
                >
                  {Object.entries(libraries).map(([key, lib]) => (
                    <option key={key} value={key}>
                      {lib.name} - v{lib.version}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {libraries[selectedLib].description}
                </p>
              </div>

              {/* 파일 업로드 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  파일 선택
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  모든 파일 형식 허용 (취약점 테스트용)
                </p>
              </div>

              {/* 업로드된 파일 목록 */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">업로드된 파일:</h3>
                  <div className="space-y-3">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{file.name}</span>
                          <span className="text-sm text-gray-500">
                            {utils.formatBytes(file.size)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>타입: {file.type || 'unknown'}</p>
                          <p>라이브러리: {libraries[file.library].name} v{libraries[file.library].version}</p>
                          <p>업로드 시간: {new Date(file.uploadTime).toLocaleString()}</p>
                          <p className="font-mono text-xs mt-1">Hash: {file.hash}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 결과 탭 */}
          {activeTab === 'results' && scanResults.length > 0 && (
            <div className="space-y-4">
              {scanResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{result.type}</h3>
                      <p className="text-sm text-gray-600">{result.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      result.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      result.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {result.severity}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p><span className="font-medium">CWE:</span> {CWE_DATABASE[result.cweId]}</p>
                    <p><span className="font-medium">상세:</span> {result.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 패킷 모니터링 탭 */}
          {activeTab === 'packets' && (
            <div className="space-y-4">
              {packetLogs.map(packet => (
                <div key={packet.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{packet.type} Request</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(packet.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium mb-2">Headers:</h4>
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(packet.headers, null, 2)}
                    </pre>
                    <h4 className="font-medium mt-3 mb-2">Body:</h4>
                    <p className="text-sm">{packet.body}</p>
                    <p className="text-sm mt-2">Size: {utils.formatBytes(packet.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 감사 로그 탭 */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              {auditLogs.map(log => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{log.eventType}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p><span className="font-medium">User:</span> {log.userId}</p>
                    <p><span className="font-medium">IP:</span> {log.ipAddress}</p>
                    <p><span className="font-medium">Details:</span></p>
                    <pre className="bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 리포트 탭 */}
          {activeTab === 'report' && reportData && (
            <div className="space-y-6">
              {/* 요약 정보 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">취약점 분석 요약</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">총 점검 항목</p>
                    <p className="text-2xl font-bold">{reportData.summary.totalChecks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">발견된 취약점</p>
                    <p className="text-2xl font-bold">{reportData.summary.vulnerabilitiesFound}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">전체 위험도</p>
                    <p className={`text-2xl font-bold ${
                      reportData.summary.overallRisk === 'CRITICAL' ? 'text-red-600' :
                      reportData.summary.overallRisk === 'HIGH' ? 'text-orange-600' :
                      reportData.summary.overallRisk === 'MEDIUM' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {reportData.summary.overallRisk}
                    </p>
                  </div>
                </div>
              </div>

              {/* 상세 분석 결과 */}
              <div>
                <h3 className="text-lg font-medium mb-4">상세 분석 결과</h3>
                <div className="space-y-4">
                  {reportData.details.map((detail, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{detail.type}</h4>
                        <span className={`px-2 py-1 rounded text-sm ${
                          detail.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          detail.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          detail.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {detail.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{detail.description}</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium mb-2">권장 조치사항:</h5>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {detail.recommendations.map((rec, idx) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileSecurityPlatform;