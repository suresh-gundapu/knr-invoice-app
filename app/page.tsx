'use client'
import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
// @ts-ignore
import { toWords } from 'number-to-words';

// బయట డిఫైన్ చేసాం, టైప్స్ ఎర్రర్ రాకుండా ఉండటానికి
const defaultAlignments = {
  irn: { x: 112, y: 755 },
  invoiceNo: { x: 330, y: 743 }, invoiceDate: { x: 330, y: 731 },
  poNo: { x: 330, y: 719 }, poDate: { x: 330, y: 706 },
  vehicleNo: { x: 330, y: 692 }, transporter: { x: 330, y: 680 },
  
  shippedName: { x: 355, y: 617 }, shippedAdd1: { x: 355, y: 603 }, shippedAdd2: { x: 355, y: 590 },
  shippedState: { x: 355, y: 577 }, shippedGstin: { x: 355, y: 564 }, shippedIncoterms: { x: 355, y: 551 },

  desc1: { x: 21, y: 483 }, hsn1: { x: 210, y: 483 }, size1: { x: 263, y: 483 }, qty1: { x: 290, y: 483 }, uom1: { x: 337, y: 483 },
  basic1: { x: 356, y: 483 }, transport1: { x: 409, y: 483 }, net1: { x: 454, y: 483 }, total1: { x: 526, y: 483 },
  
  desc2: { x: 21, y: 458 }, hsn2: { x: 215, y: 458 }, size2: { x: 272, y: 458 }, qty2: { x: 295, y: 458 }, uom2: { x: 333, y: 458 },
  basic2: { x: 345, y: 458 }, transport2: { x: 400, y: 458 }, net2: { x: 450, y: 458 }, total2: { x: 520, y: 458 },

  taxableAmt: { x: 520, y: 310 }, igstAmt: { x: 520, y: 291 }, 
  totalAmt: { x: 520, y: 261 }, roundAmt: { x: 540, y: 237 }, finalAmt: { x: 520, y: 225 },
  wordsAmt: { x: 133, y: 210 }
};

type AlignmentKey = keyof typeof defaultAlignments;

export default function Home() {
  const [formData, setFormData] = useState({
    irn: 'd085ccd96f7a944a0edea0466fbb58e693cd7adcc302f183f307816673312be8',
    invoiceNo: 'CSP126D000047367', invoiceDate: '08.10.2026',
    poNo: 'KNRCL/RUNGTA/PD/PO/2025', poDate: '11.09.2026',
    vehicleNo: 'TG29T0601', transporter: 'SER TRANSPORT PRIVATE LIMITED',
    
    shippedName: 'KNR CONSTRUCTIONS LIMITED',
    shippedAdd1: 'Nandikonda, Nalgonda',
    shippedAdd2: 'Nandikonda Pin- 508202',
    shippedState: 'Telangana, 36',
    shippedGstin: '36AAACK8316L1ZB',
    shippedIncoterms: 'NANDIKONDA',

    desc1: 'DI PIPE 200 MM X K7 XL 5.5 (BB COATED) /', 
    hsn1: '73030030', 
    size1Top: '5.50', size1Bot: '78', 
    qty1: '429', uom1: 'M', basic1: '1138.44', transport1: '167.19',
    
    desc2: 'TYTON GASKET, DN200, EPDM/', 
    hsn2: '40169340', 
    size2Top: '-', size2Bot: '78', 
    qty2: '78', uom2: 'NOS', basic2: '', transport2: '' 
  });

  const [alignments, setAlignments] = useState(defaultAlignments);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedConfig = localStorage.getItem('knrFullAlignments');
      if (savedConfig) {
        setAlignments(prev => ({ ...prev, ...JSON.parse(savedConfig) }));
      }
    } catch (e: any) { 
      console.error(e); 
    }
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleAlignChange = (field: AlignmentKey, axis: 'x' | 'y', value: string) => {
    setAlignments(prev => ({ ...prev, [field]: { ...prev[field], [axis]: Number(value) } }));
  };

  const saveConfig = () => {
    localStorage.setItem('knrFullAlignments', JSON.stringify(alignments));
    alert("అన్ని అలైన్‌మెంట్స్ సేవ్ అయ్యాయి!");
  };

  const formatAmount = (num: number | string) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatQty = (num: number | string) => Number(num).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const generatePDF = async () => {
    try {
      const response = await fetch('/blank_template.pdf');
      if (!response.ok) throw new Error("File '/blank_template.pdf' dhorakaledhu.");
      
      const existingPdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const firstPage = pdfDoc.getPages()[0];
      
      const fontSize = 7.7; 
      const textColor = rgb(0.12, 0.12, 0.12); 
      const textOpacity = 0.9; 

      // ITEM 1 Math
      const qty1 = parseFloat(formData.qty1) || 0;
      const basic1 = parseFloat(formData.basic1) || 0;
      const transport1 = parseFloat(formData.transport1) || 0;
      const net1 = basic1 + transport1;
      const item1Total = qty1 * net1;

      // ITEM 2 Math
      const qty2 = parseFloat(formData.qty2) || 0;
      const basic2 = parseFloat(formData.basic2) || 0;
      const transport2 = parseFloat(formData.transport2) || 0;
      const net2 = basic2 > 0 ? (basic2 + transport2) : 0;
      const item2Total = basic2 > 0 ? (qty2 * net2) : 0;

      // GRAND TOTALS
      const taxableAmount = item1Total + item2Total;
      const igst = taxableAmount * 0.18;
      const totalAmount = taxableAmount + igst;
      const roundedTotal = Math.round(totalAmount);
      const roundingDiff = Math.abs(roundedTotal - totalAmount);
      
      let amountInWords = toWords(roundedTotal).replace(/-/g, ' ');
      amountInWords = amountInWords.replace(/\b\w/g, (l: string) => l.toUpperCase()) + ' Rupees Only';

      const draw = (text: string | number, key: AlignmentKey, isBold: boolean = false, customSize: number = fontSize, dy: number = 0) => {
        if(!text || text === '0.00') return;
        if(!alignments[key]) throw new Error(`Key '${key}' miss ayyindi.`);
        firstPage.drawText(String(text), { 
          x: alignments[key].x, y: alignments[key].y + dy, 
          size: customSize, font: isBold ? fontBold : fontNormal, 
          color: textColor, opacity: textOpacity 
        });
      };

      draw(formData.irn, 'irn', false, 7.5); 
      draw(formData.invoiceNo, 'invoiceNo'); draw(formData.invoiceDate, 'invoiceDate');
      draw(formData.poNo, 'poNo'); draw(formData.poDate, 'poDate');
      draw(formData.vehicleNo, 'vehicleNo'); draw(formData.transporter, 'transporter');

      draw(formData.shippedName, 'shippedName', true); 
      draw(formData.shippedAdd1, 'shippedAdd1'); draw(formData.shippedAdd2, 'shippedAdd2'); 
      draw(formData.shippedState, 'shippedState'); draw(formData.shippedGstin, 'shippedGstin'); 
      draw(formData.shippedIncoterms, 'shippedIncoterms');

      // ITEM 1
      draw(formData.desc1, 'desc1'); draw(formData.hsn1, 'hsn1'); 
      draw(formData.size1Top, 'size1', false, fontSize, 0); draw(formData.size1Bot, 'size1', false, fontSize, -12); 
      draw(formatQty(qty1), 'qty1'); draw(formData.uom1, 'uom1'); 
      draw(formatAmount(basic1), 'basic1'); draw(formatAmount(transport1), 'transport1'); 
      draw(formatAmount(net1), 'net1'); draw(formatAmount(item1Total), 'total1');

      // ITEM 2
      draw(formData.desc2, 'desc2'); draw(formData.hsn2, 'hsn2'); 
      draw(formData.size2Top, 'size2', false, fontSize, 0); draw(formData.size2Bot, 'size2', false, fontSize, -12);
      draw(formatQty(qty2), 'qty2'); draw(formData.uom2, 'uom2');
      if (basic2 > 0) {
        draw(formatAmount(basic2), 'basic2'); draw(formatAmount(transport2), 'transport2');
        draw(formatAmount(net2), 'net2'); draw(formatAmount(item2Total), 'total2');
      }

      // TOTALS
      draw(formatAmount(taxableAmount), 'taxableAmt'); 
      draw(formatAmount(igst), 'igstAmt');
      draw(formatAmount(totalAmount), 'totalAmt'); 
      draw(formatAmount(roundingDiff), 'roundAmt');
      draw(formatAmount(roundedTotal), 'finalAmt', true);
      draw(amountInWords, 'wordsAmt', false);

      const pdfBytes = await pdfDoc.save();
      // Type casting to avoid TypeScript Uint8Array to BlobPart mismatch
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_${formData.invoiceNo}.pdf`;
      link.click();
      
    } catch (error: any) {
      console.error(error);
      alert("Error Vachindi: " + (error.message || error));
    }
  };

  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px', width: '100%', boxSizing: 'border-box' as const };
  const alignBox = { padding: '5px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

  if (!isClient) return null;

  return (
    <div style={{ padding: '15px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '10px', fontSize: '20px' }}>KNR Invoice - Mobile Friendly</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* LEFT PANEL: FORM INPUTS */}
        <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <h4 style={{ margin: '10px 0' }}>1. Enter Details</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={{fontSize:'10px', fontWeight:'bold'}}>IRN Code</label><input name="irn" value={formData.irn} onChange={handleFormChange} style={inputStyle} /></div>
            
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Invoice No</label><input name="invoiceNo" value={formData.invoiceNo} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Invoice Date</label><input name="invoiceDate" value={formData.invoiceDate} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>PO No</label><input name="poNo" value={formData.poNo} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>PO Date</label><input name="poDate" value={formData.poDate} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Vehicle No</label><input name="vehicleNo" value={formData.vehicleNo} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Transporter</label><input name="transporter" value={formData.transporter} onChange={handleFormChange} style={inputStyle} /></div>
            
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #ccc', margin: '10px 0' }}></div>
            
            <div style={{ gridColumn: '1 / -1' }}><label style={{fontSize:'10px', fontWeight:'bold'}}>Shipped Consignee (Bold)</label><input name="shippedName" value={formData.shippedName} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Shipped Addr 1</label><input name="shippedAdd1" value={formData.shippedAdd1} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Shipped Addr 2</label><input name="shippedAdd2" value={formData.shippedAdd2} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Shipped State</label><input name="shippedState" value={formData.shippedState} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Shipped GSTIN</label><input name="shippedGstin" value={formData.shippedGstin} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Incoterms</label><input name="shippedIncoterms" value={formData.shippedIncoterms} onChange={handleFormChange} style={inputStyle} /></div>
            
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #ccc', margin: '10px 0' }}></div>

            <div style={{ gridColumn: '1 / -1' }}><label style={{fontSize:'12px', color:'blue', fontWeight:'bold'}}>ITEM 1</label></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={{fontSize:'10px', fontWeight:'bold'}}>Desc 1</label><input name="desc1" value={formData.desc1} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Size PCS Top</label><input name="size1Top" value={formData.size1Top} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Size PCS Bot</label><input name="size1Bot" value={formData.size1Bot} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Qty 1</label><input name="qty1" value={formData.qty1} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Basic Rate 1</label><input name="basic1" value={formData.basic1} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Transport 1</label><input name="transport1" value={formData.transport1} onChange={handleFormChange} style={inputStyle} /></div>
            
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #eee', margin: '5px 0' }}></div>
            
            <div style={{ gridColumn: '1 / -1' }}><label style={{fontSize:'12px', color:'blue', fontWeight:'bold'}}>ITEM 2 (Optional Rates)</label></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={{fontSize:'10px', fontWeight:'bold'}}>Desc 2</label><input name="desc2" value={formData.desc2} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Size PCS Top</label><input name="size2Top" value={formData.size2Top} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Size PCS Bot</label><input name="size2Bot" value={formData.size2Bot} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Qty 2</label><input name="qty2" value={formData.qty2} onChange={handleFormChange} style={inputStyle} /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Basic Rate 2</label><input name="basic2" value={formData.basic2} onChange={handleFormChange} style={inputStyle} placeholder="Leave blank if none" /></div>
            <div><label style={{fontSize:'10px', fontWeight:'bold'}}>Transport 2</label><input name="transport2" value={formData.transport2} onChange={handleFormChange} style={inputStyle} placeholder="Leave blank if none" /></div>
          </div>
          
          <button onClick={generatePDF} style={{ marginTop: '20px', padding: '15px', backgroundColor: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', width: '100%', borderRadius: '5px' }}>
            Generate PDF
          </button>
        </div>

        {/* RIGHT PANEL: ALIGNMENT CONTROLS */}
        <div style={{ flex: '1 1 35%', minWidth: '300px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px', border: '1px solid #ddd' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>2. X/Y Alignment Settings</h4>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button onClick={saveConfig} style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
              Save Alignments
            </button>
          </div>

          <div style={{ height: '450px', overflowY: 'auto', paddingRight: '5px' }}>
            {Object.keys(alignments).map((f) => {
              const field = f as AlignmentKey;
              return (
                <div key={field} style={alignBox}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', width: '40%' }}>{field}</span>
                  <span style={{ fontSize: '10px' }}>X:</span>
                  <input type="number" value={alignments[field].x} onChange={(e) => handleAlignChange(field, 'x', e.target.value)} style={{ width: '45px', padding:'2px', fontSize:'11px' }} />
                  <span style={{ fontSize: '10px', marginLeft: '5px' }}>Y:</span>
                  <input type="number" value={alignments[field].y} onChange={(e) => handleAlignChange(field, 'y', e.target.value)} style={{ width: '45px', padding:'2px', fontSize:'11px' }} />
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}