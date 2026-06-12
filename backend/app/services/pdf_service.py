from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

def generate_pdf_report(run) -> BytesIO:
    """Generates a professional corporate PDF audit report using ReportLab platypus."""
    buffer = BytesIO()
    
    # Establish document layout (Margins: 0.5 in / ~36pt)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Corporate Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.HexColor('#2563eb'),
        spaceAfter=15
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=12,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=10,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155')
    )

    table_cell_bold_style = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )
    
    story = []
    
    # 1. Header Banner
    story.append(Paragraph("IM-07 INVENTORY RECONCILIATION ENGINE", subtitle_style))
    story.append(Paragraph("Infrastructure Reconciliation Audit Report", title_style))
    story.append(Spacer(1, 8))
    
    # 2. Metadata Section
    created_at_str = run.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if isinstance(run.created_at, datetime) else str(run.created_at)
    
    # Color risk badge Hex
    risk_hex = '#22c55e'  # Low
    r = run.gemini_risk_level.lower()
    if r == 'medium':
        risk_hex = '#f97316'
    elif r == 'high':
        risk_hex = '#ef4444'
        
    meta_data = [
        [
            Paragraph("<b>Audit Run ID:</b>", body_style), 
            Paragraph(f"#{run.id}", body_style),
            Paragraph("<b>Risk Assessment:</b>", body_style), 
            Paragraph(f"<font color='{risk_hex}'><b>{run.gemini_risk_level} Risk</b></font>", body_style)
        ],
        [
            Paragraph("<b>Execution Time:</b>", body_style), 
            Paragraph(created_at_str, body_style),
            Paragraph("<b>Total Assets:</b>", body_style), 
            Paragraph(f"CMDB: {run.total_cmdb_assets} / Live: {run.total_live_assets}", body_style)
        ]
    ]
    # Total printable width is 8.5" * 72 - 72 = 540pt
    meta_table = Table(meta_data, colWidths=[100, 170, 110, 160])
    meta_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))
    
    # 3. Executive Summary Card
    story.append(Paragraph("Executive Summary", section_heading))
    story.append(Paragraph(run.gemini_summary or "No executive summary available for this reconciliation run.", body_style))
    story.append(Spacer(1, 8))
    
    # 4. Recommended Actions
    story.append(Paragraph("Recommended Mitigation Actions", section_heading))
    actions = run.gemini_recommended_actions or []
    if actions:
        for action in actions:
            story.append(Paragraph(f"• {action}", body_style))
    else:
        story.append(Paragraph("No recommended actions provided.", body_style))
    story.append(Spacer(1, 14))
    
    # 5. Missing Assets Table
    story.append(Paragraph(f"Missing Assets Details ({run.missing_count})", section_heading))
    missing_list = run.missing_assets or []
    if missing_list:
        table_data = [[Paragraph("Asset ID", table_header_style), Paragraph("Intended Hostname", table_header_style)]]
        for item in missing_list:
            asset_id = item.get("asset_id", "N/A")
            asset_name = item.get("asset_name") or item.get("hostname") or "N/A"
            table_data.append([
                Paragraph(asset_id, table_cell_bold_style),
                Paragraph(asset_name, table_cell_style)
            ])
        t = Table(table_data, colWidths=[150, 390])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#ef4444')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
    else:
        story.append(Paragraph("No missing assets detected (CMDB fully synchronized with active networks).", body_style))
    story.append(Spacer(1, 14))
    
    # 6. Extra Live Assets Table
    story.append(Paragraph(f"Unregistered Live Assets Details ({run.extra_count})", section_heading))
    extra_list = run.extra_assets or []
    if extra_list:
        table_data = [[Paragraph("Asset ID", table_header_style), Paragraph("Discovered Hostname", table_header_style)]]
        for item in extra_list:
            asset_id = item.get("asset_id", "N/A")
            asset_name = item.get("asset_name") or item.get("hostname") or "N/A"
            table_data.append([
                Paragraph(asset_id, table_cell_bold_style),
                Paragraph(asset_name, table_cell_style)
            ])
        t = Table(table_data, colWidths=[150, 390])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f97316')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
    else:
        story.append(Paragraph("No unregistered live assets detected running.", body_style))
    story.append(Spacer(1, 14))
    
    # 7. Naming Mismatches Table
    story.append(Paragraph(f"Naming Mismatches Details ({run.mismatch_count})", section_heading))
    mismatch_list = run.naming_mismatches or []
    if mismatch_list:
        table_data = [
            [
                Paragraph("Asset ID", table_header_style),
                Paragraph("CMDB Intended Name", table_header_style),
                Paragraph("Active Live Name", table_header_style)
            ]
        ]
        for item in mismatch_list:
            table_data.append([
                Paragraph(item.get("asset_id", "N/A"), table_cell_bold_style),
                Paragraph(item.get("cmdb_name", "N/A"), table_cell_style),
                Paragraph(item.get("live_name", "N/A"), table_cell_style)
            ])
        t = Table(table_data, colWidths=[150, 195, 195])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#eab308')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
    else:
        story.append(Paragraph("No naming configuration conflicts detected.", body_style))
        
    doc.build(story)
    buffer.seek(0)
    return buffer
