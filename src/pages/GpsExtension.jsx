import React, { useState, useEffect, useRef } from 'react';
import { Marker, Polyline, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  FiArrowLeft, FiCalendar, FiImage, FiCamera, FiMoreVertical, FiPlus, FiSearch, FiCheck,
  FiRotateCcw, FiTrash2, FiChevronRight, FiDownload, FiFileText, FiGrid, FiActivity
} from 'react-icons/fi';
import { FaRulerCombined, FaDrawPolygon, FaMap } from 'react-icons/fa';
import { MdTouchApp, MdDirectionsWalk } from 'react-icons/md';

// --- HELPER: GEOMETRY CALCULATIONS ---
const calculateDistance = (points) => {
  if (points.length < 2) return 0;
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += L.latLng(points[i]).distanceTo(points[i+1]);
  }
  return totalDistance; // meters
};

const calculateArea = (points) => {
  if (points.length < 3) return 0;
  const earthRadius = 6378137;
  let area = 0;
  if (points.length > 2) {
    for (var i = 0; i < points.length; i++) {
      var j = (i + 1) % points.length;
      area += (points[j].lng - points[i].lng) * (2 + Math.sin(points[i].lat * Math.PI / 180) + Math.sin(points[j].lat * Math.PI / 180));
    }
    area = Math.abs(area * earthRadius * earthRadius * Math.PI / 360);
  }
  return area; // square meters
};

const formatArea = (sqMeters) => {
  const acres = sqMeters * 0.000247105;
  if (acres < 1) return `${sqMeters.toFixed(2)} sq m`;
  return `${acres.toFixed(2)} Acres`;
};

const formatDistance = (meters) => {
  if (meters > 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters.toFixed(2)} m`;
};

// --- COMPONENT: MENU OPTION (Shared) ---
export const MenuOption = ({ icon, label, onClick, subLabel }) => (
  <div style={styles.menuOptionContainer} onClick={onClick}>
    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
        <span style={styles.menuLabel}>{label}</span>
        {subLabel && <span style={styles.menuSubLabel}>{subLabel}</span>}
    </div>
    <div style={styles.menuIconContainer}>
      {icon}
    </div>
  </div>
);

// --- COMPONENT: MEASURE TOOL (Field & Distance) ---
export const MeasureTool = ({ mode, active, onExit, onSave }) => {
  const [points, setPoints] = useState([]);
  
  useMapEvents({
    click(e) {
      if (active) setPoints(prev => [...prev, e.latlng]);
    },
  });

  const undo = () => setPoints(prev => prev.slice(0, -1));
  const clear = () => setPoints([]);

  const result = mode === 'field' ? calculateArea(points) : calculateDistance(points);
  const resultText = mode === 'field' ? formatArea(result) : formatDistance(result);

  if (!active) return null;

  return (
    <>
      {/* DRAWING ON MAP */}
      {mode === 'distance' && points.length > 0 && (
        <>
          <Polyline positions={points} color="blue" weight={4} />
          {points.map((p, i) => <Marker key={i} position={p} />)}
        </>
      )}
      {mode === 'field' && points.length > 0 && (
        <>
          <Polygon positions={points} color="#4ade80" fillColor="#4ade80" fillOpacity={0.4} />
          {points.map((p, i) => <Marker key={i} position={p} />)}
        </>
      )}

      {/* TOP BAR FOR MEASURE */}
      <div style={styles.measureTopBar}>
         <button onClick={onExit} style={styles.iconBtn}><FiArrowLeft size={24} /></button>
         <div style={styles.readout}>
            <span style={{fontSize: '12px', color: '#aaa'}}>{mode === 'field' ? 'AREA' : 'DISTANCE'}</span>
            <span style={{fontSize: '18px', fontWeight: 'bold', color: '#fff'}}>{resultText}</span>
         </div>
         <button onClick={() => onSave({ points, type: mode, value: resultText })} style={styles.saveBtn}>NEXT</button>
      </div>

      {/* BOTTOM CONTROLS */}
      <div style={styles.bottomControls}>
         <button onClick={undo} style={styles.roundBtn}><FiRotateCcw size={20} color="#000"/></button>
         <button onClick={clear} style={styles.roundBtnRed}><FiTrash2 size={20}/></button>
      </div>
    </>
  );
};

// --- COMPONENT: SUB MENUS ---
export const ImportMenu = ({ onBack }) => (
    <>
      <div style={styles.subMenuHeader}>
        <button onClick={onBack} style={styles.backBtn}><FiArrowLeft size={20} color="#000"/></button>
        <span style={styles.subMenuTitle}>Select Format</span>
      </div>
      <MenuOption icon={<FiImage size={24} />} label="JPEG Image" onClick={() => alert("Importing JPEG...")} />
      <MenuOption icon={<FiFileText size={24} />} label="PDF Document" onClick={() => alert("Importing PDF...")} />
      <MenuOption icon={<FiGrid size={24} />} label="KML File" onClick={() => alert("Importing KML...")} />
      <MenuOption icon={<FiActivity size={24} />} label="GPX File" onClick={() => alert("Importing GPX...")} />
      <MenuOption icon={<FaMap size={24} />} label="GeoJSON" onClick={() => alert("Importing GeoJSON...")} />
    </>
);

export const MeasureMenu = ({ type, onBack, onStart }) => (
    <>
      <div style={styles.subMenuHeader}>
        <button onClick={onBack} style={styles.backBtn}><FiArrowLeft size={20} color="#000"/></button>
        <span style={styles.subMenuTitle}>{type === 'field' ? "Measure Field" : "Measure Distance"}</span>
      </div>
      <MenuOption icon={<MdTouchApp size={24} />} label="Manual Measuring" subLabel="Tap on map" onClick={() => onStart('manual')} />
      <MenuOption icon={<MdDirectionsWalk size={24} />} label="GPS Measuring" subLabel="Walk boundary" onClick={() => alert(`GPS Mode Coming Soon`)} />
    </>
);

// --- COMPONENT: FILE MANAGER ---
export const FileManager = ({ onClose, files = [] }) => {
  return (
    <div style={styles.fullScreenBlack}>
      <div style={styles.header}>
        <button onClick={onClose} style={styles.iconBtn}><FiArrowLeft size={24}/></button>
        <span style={styles.title}>Saved Records</span>
        <div style={{width: 24}}></div>
      </div>
      <div style={styles.listContainer}>
        {files.length === 0 ? <div style={{textAlign:'center', color:'#666', marginTop:50}}>No files saved yet.</div> : files.map((file, i) => (
             <div key={i} style={styles.fileItem}>
                <div style={styles.fileIcon}>{file.type === 'field' ? <FaDrawPolygon color="#4ade80"/> : <FaRulerCombined color="#60a5fa"/>}</div>
                <div style={{flex: 1}}>
                   <div style={styles.fileName}>{file.details?.title || 'Untitled'}</div>
                   <div style={styles.fileDetail}>{file.details?.date}</div>
                </div>
                <FiChevronRight color="#555"/>
             </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT: SAVE SCREEN ---
export const SaveScreen = ({ poiData, setPoiData, onBack, onSave, onOpenGroupBtn }) => {
    const [photoPreview, setPhotoPreview] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const fileInputRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handlePhotoSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoPreview(URL.createObjectURL(file));
            setPoiData({ ...poiData, photoFile: file }); 
        }
    };

    const formattedDate = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    return (
        <div style={styles.fullScreenBlack}>
            <div style={styles.saveHeader}>
                <button onClick={onBack} style={styles.iconBtnWhite}><FiArrowLeft size={24} /></button>
                <span style={styles.headerTitleGold}>Save POI</span>
                <button onClick={() => onSave(poiData)} style={styles.headerTextBtn}>SAVE</button>
            </div>
            <div style={styles.formContainer}>
                <label style={styles.inputLabel}>Title</label>
                <input type="text" style={styles.inputField} placeholder="Enter title" value={poiData.title} onChange={(e) => setPoiData({...poiData, title: e.target.value})}/>
                <label style={styles.inputLabel}>Description</label>
                <input type="text" style={styles.inputField} placeholder="Optional description" value={poiData.description} onChange={(e) => setPoiData({...poiData, description: e.target.value})}/>
                <label style={styles.inputLabel}>Group</label>
                <div style={styles.groupSelector} onClick={onOpenGroupBtn}>
                    <div style={{display:'flex', alignItems:'center'}}>
                        <div style={{...styles.colorDot, backgroundColor: poiData.group.color, border: poiData.group.color === 'transparent' ? '1px solid #666' : 'none'}}></div>
                        <span style={{color: '#fff', fontSize:'16px'}}>{poiData.group.name}</span>
                    </div>
                    <FiChevronRight size={20} color="#666" />
                </div>
                <label style={styles.inputLabel}>Date</label>
                <div style={styles.dateDisplay}>
                    <FiCalendar size={18} style={{marginRight: 10}}/>
                    {formattedDate}
                    <span style={{marginLeft: 'auto', fontSize:'12px'}}>{formattedTime}</span>
                </div>
                <label style={styles.inputLabel}>Photo</label>
                <div style={styles.photoContainer} onClick={() => !photoPreview && fileInputRef.current.click()}>
                    <input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}} onChange={handlePhotoSelect}/>
                    {photoPreview ? (
                        <div style={{width: '100%', height: '100%', position: 'relative'}}>
                             <img src={photoPreview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} />
                             <button style={styles.removePhotoBtn} onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setPoiData({...poiData, photoFile: null}); }}>X</button>
                        </div>
                    ) : (
                        <div style={styles.photoPlaceholder}>
                            <FiImage size={60} color="#555" />
                            <span style={styles.photoText}>Tap to add photo</span>
                            <button style={styles.addPhotoBtn} onClick={(e) => {e.stopPropagation(); fileInputRef.current.click();}}>
                                <FiCamera size={16} style={{marginRight: 8}}/> ADD PHOTO
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: GROUP SCREEN ---
export const GroupScreen = ({ groups, onSelect, onBack, onCreateGroup }) => {
    const [showModal, setShowModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState('#4ade80');
    const colorPalette = ['#4ade80', '#facc15', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', '#fb923c', '#94a3b8', '#2dd4bf', '#e879f9', '#f43f5e', '#84cc16'];

    return (
        <div style={styles.fullScreenBlack}>
            <div style={styles.saveHeader}>
                <button onClick={onBack} style={styles.iconBtnWhite}><FiArrowLeft size={24} /></button>
                <span style={styles.headerTitleGold}>Groups</span>
                <div style={{display:'flex'}}>
                    <button style={styles.iconBtnWhite}><FiSearch size={22} /></button>
                    <button onClick={() => setShowModal(true)} style={styles.iconBtnWhite}><FiPlus size={24} /></button>
                </div>
            </div>
            <div style={styles.groupList}>
                {groups.map((grp, idx) => (
                    <div key={idx} style={styles.groupItem} onClick={() => onSelect(grp)}>
                        <div style={{...styles.colorDotLarge, backgroundColor: grp.color, border: grp.name === 'Without group' ? '1px solid #666' : 'none'}}></div>
                        <span style={styles.groupName}>{grp.name}</span>
                        <FiMoreVertical size={20} color="#555" style={{marginLeft: 'auto'}}/>
                    </div>
                ))}
            </div>
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={styles.modalTitle}>Create new group</h3>
                        <label style={styles.inputLabel}>Group name</label>
                        <input autoFocus type="text" style={styles.modalInput} value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                        <label style={styles.inputLabel}>Group color</label>
                        <div style={styles.colorGrid}>
                            {colorPalette.map(color => (
                                <div key={color} onClick={() => setNewGroupColor(color)} style={{...styles.colorSwatch, backgroundColor: color, border: newGroupColor === color ? '2px solid #fff' : 'none', transform: newGroupColor === color ? 'scale(1.1)' : 'scale(1)'}}>
                                    {newGroupColor === color && <FiCheck color="#fff" size={14}/>}
                                </div>
                            ))}
                        </div>
                        <div style={styles.modalActions}>
                            <button onClick={() => setShowModal(false)} style={styles.modalCancelBtn}>Cancel</button>
                            <button onClick={() => { if(newGroupName){ onCreateGroup({ name: newGroupName, color: newGroupColor }); setShowModal(false); } }} style={styles.modalSaveBtn}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SHARED STYLES ---
const styles = {
  menuOptionContainer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '15px', cursor: 'pointer' },
  menuLabel: { backgroundColor: '#fff', color: '#000', padding: '8px 12px', borderRadius: '8px', marginRight: '10px', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  menuSubLabel: { backgroundColor: 'rgba(255,255,255,0.8)', color: '#555', padding: '4px 8px', borderRadius: '6px', marginRight: '10px', marginTop: '4px', fontWeight: '400', fontSize: '11px', textAlign: 'right' },
  menuIconContainer: { width: '50px', height: '50px', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  
  // Measure Tool
  measureTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: '60px', backgroundColor: '#222', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' },
  readout: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  saveBtn: { backgroundColor: '#4ade80', border: 'none', borderRadius: '4px', padding: '6px 15px', fontWeight: 'bold', cursor: 'pointer' },
  bottomControls: { position: 'absolute', bottom: '30px', left: '15px', zIndex: 1000, display: 'flex', gap: '15px' },
  roundBtn: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fff', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  roundBtnRed: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ef4444', color:'#fff', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  iconBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display:'flex', alignItems:'center' },

  // Sub Menus
  subMenuHeader: { display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '5px', backgroundColor: '#fff', padding: '5px 10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', display:'flex', alignItems:'center', marginRight: '10px' },
  subMenuTitle: { fontWeight: 'bold', fontSize: '14px' },

  // Full Screen
  fullScreenBlack: { position: 'fixed', inset: 0, backgroundColor: '#121212', zIndex: 2000, display: 'flex', flexDirection: 'column' },
  header: { height: '60px', backgroundColor: '#7B5E00', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px' },
  title: { color: '#fff', fontSize: '18px', fontWeight: 'bold' },
  listContainer: { padding: '20px', overflowY: 'auto' },
  fileItem: { display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: '#1e1e1e', marginBottom: '10px', borderRadius: '8px' },
  fileIcon: { width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' },
  fileName: { color: '#fff', fontWeight: 'bold' },
  fileDetail: { color: '#888', fontSize: '12px' },

  // Save/Group Screens
  saveHeader: { height: '60px', backgroundColor: '#7B5E00', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px' },
  iconBtnWhite: { background: 'transparent', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '5px' },
  headerTitleGold: { color: '#fff', fontSize: '18px', fontWeight: 'bold' },
  headerTextBtn: { background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' },
  formContainer: { padding: '20px', flex: 1, overflowY: 'auto' },
  inputLabel: { display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '5px', marginTop: '15px' },
  inputField: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#fff', fontSize: '16px', padding: '8px 0', outline: 'none' },
  groupSelector: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #333', cursor: 'pointer' },
  colorDot: { width: '16px', height: '16px', borderRadius: '50%', marginRight: '10px' },
  dateDisplay: { display: 'flex', alignItems: 'center', color: '#fff', fontSize: '16px', padding: '10px 0', borderBottom: '1px solid #333' },
  photoContainer: { marginTop: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' },
  photoPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  photoText: { color: '#777', fontSize: '14px', marginTop: '10px', marginBottom: '15px' },
  addPhotoBtn: { backgroundColor: '#7B5E00', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer' },
  removePhotoBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' },
  groupList: { padding: '20px', flex: 1 },
  groupItem: { display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #222', cursor: 'pointer' },
  colorDotLarge: { width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' },
  groupName: { color: '#fff', fontSize: '16px' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 },
  modalContent: { backgroundColor: '#1e1e1e', borderRadius: '12px', padding: '20px', width: '80%', maxWidth: '300px' },
  modalTitle: { color: '#fff', fontSize: '18px', marginBottom: '20px' },
  modalInput: { width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: '1px solid #7B5E00', color: '#fff', fontSize: '16px', padding: '5px 0', marginBottom: '20px', outline: 'none' },
  colorGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '25px' },
  colorSwatch: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '20px' },
  modalCancelBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '14px', cursor: 'pointer' },
  modalSaveBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
};