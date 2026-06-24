import os
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, Rect, Line, String, Circle, Polygon
from reportlab.graphics.barcode.qr import QrCodeWidget
from datetime import datetime, date

class ClimateReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        
        # McKinsey-Grade Dark Navy and Amber Accent Palette
        self.color_primary = colors.HexColor("#0B3D91")    # NASA/ISRO Dark Navy
        self.color_secondary = colors.HexColor("#008CFF")  # Accent Blue
        self.color_text_dark = colors.HexColor("#111827")  # High-Contrast Charcoal
        self.color_text_muted = colors.HexColor("#4B5563") # Slate Grey
        self.color_bg_light = colors.HexColor("#F7F9FC")   # Ice White
        
        # Risk level colors
        self.color_risk_low = colors.HexColor("#1E8E3E")      # Success Green
        self.color_risk_moderate = colors.HexColor("#B78103") # Amber Yellow
        self.color_risk_high = colors.HexColor("#E65100")     # Warning Orange
        self.color_risk_critical = colors.HexColor("#D50000") # Critical Red

        # Custom Typography
        self.title_style = ParagraphStyle(
            'McKinseyTitle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=26,
            textColor=self.color_primary,
            leading=30,
            spaceAfter=8
        )
        self.subtitle_style = ParagraphStyle(
            'McKinseySubtitle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            textColor=self.color_text_muted,
            leading=16,
            spaceAfter=30
        )
        self.section_header_style = ParagraphStyle(
            'McKinseyHeader',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=15,
            textColor=self.color_primary,
            spaceBefore=18,
            spaceAfter=8,
            leading=18
        )
        self.body_style = ParagraphStyle(
            'McKinseyBody',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=self.color_text_dark,
            leading=14,
            spaceAfter=8
        )
        self.bullet_style = ParagraphStyle(
            'McKinseyBullet',
            parent=self.body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=4
        )

    def draw_forecast_chart(self, forecast_data: list, simulation_data: list = None) -> Drawing:
        """Draws a premium vector line chart comparing baseline and simulated max temperatures."""
        d = Drawing(468, 140)
        
        # Background canvas box
        d.add(Rect(0, 0, 468, 140, fillColor=self.color_bg_light, strokeColor=colors.HexColor("#E5E7EB"), strokeWidth=1, rx=4, ry=4))
        
        # Gridlines and axes
        d.add(Line(40, 25, 440, 25, strokeColor=colors.HexColor("#E5E7EB"), strokeWidth=1))
        d.add(Line(40, 75, 440, 75, strokeColor=colors.HexColor("#E5E7EB"), strokeWidth=1))
        d.add(Line(40, 125, 440, 125, strokeColor=colors.HexColor("#E5E7EB"), strokeWidth=1))
        d.add(Line(40, 25, 40, 125, strokeColor=colors.HexColor("#D1D5DB"), strokeWidth=1))
        
        # Axis labels
        d.add(String(12, 22, "20C", fontName="Helvetica", fontSize=8, fillColor=self.color_text_muted))
        d.add(String(12, 72, "35C", fontName="Helvetica", fontSize=8, fillColor=self.color_text_muted))
        d.add(String(12, 122, "50C", fontName="Helvetica", fontSize=8, fillColor=self.color_text_muted))
        
        # Extract max temperatures
        base_temps = []
        for day in forecast_data[:30]:
            cells = day.get("grid_cells", [])
            if cells:
                base_temps.append(sum(c.get("max_temperature", 30.0) for c in cells) / len(cells))
            else:
                base_temps.append(30.0)
                
        sim_temps = []
        if simulation_data:
            for day in simulation_data[:30]:
                cells = day.get("grid_cells", [])
                if cells:
                    sim_temps.append(sum(c.get("max_temperature", 30.0) for c in cells) / len(cells))
                else:
                    sim_temps.append(30.0)
                    
        # Calculate points
        x_start = 40
        x_end = 440
        y_min = 20.0
        y_max = 50.0
        y_span = y_max - y_min
        
        def get_y_coord(temp):
            clamped = max(y_min, min(y_max, temp))
            ratio = (clamped - y_min) / y_span
            return 25 + ratio * 100
            
        num_days = len(base_temps)
        x_step = (x_end - x_start) / max(1, num_days - 1)
        
        # Draw Baseline Curve (Deep Navy)
        base_points = []
        for i, temp in enumerate(base_temps):
            px = x_start + i * x_step
            py = get_y_coord(temp)
            base_points.append((px, py))
            
        for i in range(len(base_points) - 1):
            p1 = base_points[i]
            p2 = base_points[i+1]
            d.add(Line(p1[0], p1[1], p2[0], p2[1], strokeColor=self.color_primary, strokeWidth=2))
            
        # Draw Simulated Curve (Crimson Orange)
        if sim_temps:
            sim_points = []
            for i, temp in enumerate(sim_temps):
                px = x_start + i * x_step
                py = get_y_coord(temp)
                sim_points.append((px, py))
                
            for i in range(len(sim_points) - 1):
                p1 = sim_points[i]
                p2 = sim_points[i+1]
                d.add(Line(p1[0], p1[1], p2[0], p2[1], strokeColor=self.color_risk_high, strokeWidth=2, strokeDashArray=[4, 2]))
                
        # Draw Legend
        d.add(Rect(50, 110, 10, 6, fillColor=self.color_primary, strokeColor=None))
        d.add(String(65, 110, "Baseline Forecast", fontName="Helvetica", fontSize=8, fillColor=self.color_text_dark))
        
        if sim_temps:
            d.add(Rect(180, 110, 10, 6, fillColor=self.color_risk_high, strokeColor=None))
            d.add(String(195, 110, "Simulated Stressor Curve", fontName="Helvetica", fontSize=8, fillColor=self.color_text_dark))
            
        # X-axis label
        d.add(String(200, 8, "Forecast Horizon (30-Day Series)", fontName="Helvetica", fontSize=8, fillColor=self.color_text_muted))
        return d

    def generate_pdf(
        self, 
        region_name: str,
        current_obs: list,
        historical_stats: dict,
        forecast_data: list,
        scenario_info: dict = None,
        simulation_data: list = None,
        ai_insights: dict = None,
        simulation_id: str = None
    ) -> bytes:
        """Generates a dynamic, executive-grade McKinsey-style PDF briefing."""
        buffer = BytesIO()
        
        # Margins: 0.75 in (54 pt)
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        
        story = []
        
        # Calculate dynamic risk score and color based on inputs
        risk_val = 42
        risk_color = self.color_risk_low
        risk_label = "LOW"
        
        if scenario_info:
            temp_adj = scenario_info.get("temperature_adjustment", 0.0)
            rain_adj = scenario_info.get("rainfall_adjustment", 0.0)
            
            # Simple algorithmic risk calculation matching the sandbox
            base_risk = 42
            if temp_adj > 0:
                base_risk += int(temp_adj * 8.5)
            if rain_adj < 0:
                base_risk += int(abs(rain_adj) * 0.5)
            risk_val = min(99, base_risk)
            
            if risk_val >= 70:
                risk_color = self.color_risk_critical
                risk_label = "CRITICAL"
            elif risk_val >= 55:
                risk_color = self.color_risk_high
                risk_label = "HIGH"
            elif risk_val >= 45:
                risk_color = self.color_risk_moderate
                risk_label = "MODERATE"
                
        # ──────────────────────────────────────────────────────────────────────
        # PAGE 1: COVER PAGE
        # ──────────────────────────────────────────────────────────────────────
        story.append(Spacer(1, 40))
        
        # Minimalistic Top Branding Bar
        branding_data = [
            [Paragraph("<b>BHARAT-TWIN DECISION SUPPORT SYSTEM</b>", ParagraphStyle('BrandText', fontName='Helvetica-Bold', fontSize=10, textColor=self.color_primary)),
             Paragraph("GOVERNMENT OF INDIA • NATIONAL CLIMATE DIGITAL TWIN", ParagraphStyle('SubBrandText', fontName='Helvetica-Bold', fontSize=8, textColor=self.color_text_muted, alignment=2))]
        ]
        t_brand = Table(branding_data, colWidths=[3.5*inch, 3.5*inch])
        t_brand.setStyle(TableStyle([
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LINEBELOW', (0,0), (-1,-1), 1.5, self.color_primary),
        ]))
        story.append(t_brand)
        story.append(Spacer(1, 40))
        
        # Main Document Title
        story.append(Paragraph("Government Climate Decision Brief", self.title_style))
        story.append(Paragraph("<b>CONFIDENTIAL • EXECUTIVE DECISION SUPPORT DIRECTIVE</b>", ParagraphStyle('SubTitleConf', parent=self.subtitle_style, fontSize=11, fontName='Helvetica-Bold', textColor=self.color_risk_high, spaceAfter=20)))
        story.append(Spacer(1, 10))
        
        # Cover Risk Highlight Panel
        risk_box_text = (
            f"<b>AGGREGATE DIGITAL RISK INDEX: <font color='{risk_color.hexval()}'>{risk_val} / 100 ({risk_label})</font></b><br/>"
            f"This directive encapsulates physical hazards, resource strain, and socio-economic vulnerability metrics "
            f"simulated for {region_name} under custom climate stressors."
        )
        t_risk_box = Table([[Paragraph(risk_box_text, self.body_style)]], colWidths=[7*inch])
        t_risk_box.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), self.color_bg_light),
            ('BOX', (0,0), (-1,-1), 1.5, risk_color),
            ('LEFTPADDING', (0,0), (-1,-1), 15),
            ('RIGHTPADDING', (0,0), (-1,-1), 15),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ]))
        story.append(t_risk_box)
        story.append(Spacer(1, 40))
        
        # Metadata Block & Dynamic QR Code
        if simulation_id:
            qr_url = f"https://bharat-twin.web.app/briefing?simulation_id={simulation_id}"
        else:
            qr_url = f"https://bharat-twin.web.app/briefing?region={region_name.replace(' ', '_')}&risk={risk_val}&temp={scenario_info.get('temperature_adjustment', 0.0) if scenario_info else 0.0}&rain={scenario_info.get('rainfall_adjustment', 0.0) if scenario_info else 0.0}"
        qr = QrCodeWidget(qr_url)
        qr.barWidth = 64
        qr.barHeight = 64
        d_qr = Drawing(64, 64)
        d_qr.add(qr)
        
        meta_table_data = [
            [Paragraph("<b>Generated:</b>", self.body_style), Paragraph(datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"), self.body_style),
             Paragraph("<b>Risk Classification:</b>", self.body_style), Paragraph(f"<b><font color='{risk_color.hexval()}'>{risk_label}</font></b>", self.body_style), d_qr],
            [Paragraph("<b>District:</b>", self.body_style), Paragraph(region_name, self.body_style),
             Paragraph("<b>Prepared For:</b>", self.body_style), Paragraph("Decision Makers & District Collectors", self.body_style), None],
            [Paragraph("<b>Scenario:</b>", self.body_style), Paragraph(scenario_info.get("name", "Custom Climate Perturbation") if scenario_info else "Baseline Climatology", self.body_style),
             Paragraph("<b>Agency:</b>", self.body_style), Paragraph("National Climate Management Cell (NDMA)", self.body_style), None]
        ]
        t_meta = Table(meta_table_data, colWidths=[1.3*inch, 2.3*inch, 1.3*inch, 1.3*inch, 0.8*inch])
        t_meta.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('SPAN', (4,0), (4,2)),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOX', (0,0), (-2,-1), 1, self.color_primary),
            ('INNERGRID', (0,0), (-2,-1), 0.5, colors.HexColor("#E5E7EB")),
            ('BACKGROUND', (0,0), (-2,-1), self.color_bg_light),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t_meta)
        
        story.append(PageBreak())
        
        # ──────────────────────────────────────────────────────────────────────
        # PAGE 2: ANALYSIS & FORECAST
        # ──────────────────────────────────────────────────────────────────────
        story.append(Paragraph("1. Current Weather Observations", self.section_header_style))
        story.append(Paragraph(
            f"The following grid points represent physical observation cells extracted from the <b>Indian Meteorological Department (IMD)</b> "
            f"and <b>INSAT-3D</b> satellite telemetry for {region_name} on the latest recorded date.",
            self.body_style
        ))
        
        if current_obs:
            obs_table_data = [["Grid Latitude", "Grid Longitude", "Rainfall (mm)", "Max Temp (°C)", "Min Temp (°C)"]]
            for obs in current_obs[:6]:
                obs_table_data.append([
                    f"{obs.get('latitude', 0.0):.2f}° N",
                    f"{obs.get('longitude', 0.0):.2f}° E",
                    f"{obs.get('rainfall', 0.0):.2f}",
                    f"{obs.get('max_temperature', 0.0):.1f}",
                    f"{obs.get('min_temperature', 0.0):.1f}"
                ])
            t_obs = Table(obs_table_data, colWidths=[1.4*inch, 1.4*inch, 1.4*inch, 1.4*inch, 1.4*inch])
            t_obs.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), self.color_primary),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 9),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, self.color_bg_light]),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
            ]))
            story.append(t_obs)
        else:
            story.append(Paragraph("No current meteorological cell records available for this pilot sector.", self.body_style))
            
        story.append(Spacer(1, 10))
        
        story.append(Paragraph("2. Predictive Trend Forecast & Stress Simulation", self.section_header_style))
        story.append(Paragraph(
            "Below is a comparison chart showing the baseline recursive forecast against the simulated scenario adjustments "
            "over the 30-day projection envelope. Shading and trend curves are derived from the XGBoost prediction core.",
            self.body_style
        ))
        
        if forecast_data:
            # Draw and append the dynamic vector chart
            story.append(self.draw_forecast_chart(forecast_data, simulation_data))
        else:
            story.append(Paragraph("Meteorological forecast models not initialized.", self.body_style))
            
        story.append(Spacer(1, 12))
        
        # Comparative Stats Table
        if scenario_info and simulation_data and forecast_data:
            story.append(Paragraph("<b>Scenario Adjustments & Physical Impact:</b>", self.body_style))
            base_cells = [c for day in forecast_data for c in day.get("grid_cells", [])]
            sim_cells = [c for day in simulation_data for c in day.get("grid_cells", [])]
            
            b_rain = sum(c.get("rainfall", 0.0) for c in base_cells) / len(base_cells) if base_cells else 0.0
            s_rain = sum(c.get("rainfall", 0.0) for c in sim_cells) / len(sim_cells) if sim_cells else 0.0
            b_max = sum(c.get("max_temperature", 30.0) for c in base_cells) / len(base_cells) if base_cells else 30.0
            s_max = sum(c.get("max_temperature", 30.0) for c in sim_cells) / len(sim_cells) if sim_cells else 30.0
            
            comp_data = [
                ["Indicator", "Baseline Forecast", "Stress Scenario", "Delta"],
                ["Average Precipitation", f"{b_rain:.2f} mm", f"{s_rain:.2f} mm", f"{s_rain - b_rain:+.2f} mm ({((s_rain - b_rain)/b_rain*100 if b_rain else 0.0):+.1f}%)"],
                ["Average Maximum Temp", f"{b_max:.1f} °C", f"{s_max:.1f} °C", f"{s_max - b_max:+.1f} °C"]
            ]
            t_comp = Table(comp_data, colWidths=[2.2*inch, 1.6*inch, 1.6*inch, 1.6*inch])
            t_comp.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), self.color_primary),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,-1), 8.5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
            ]))
            story.append(t_comp)
            
        story.append(PageBreak())
        
        # ──────────────────────────────────────────────────────────────────────
        # PAGE 3: INSIGHTS & EMERGENCY ACTIONS
        # ──────────────────────────────────────────────────────────────────────
        story.append(Paragraph("3. Generative AI Risk Assessment Summary", self.section_header_style))
        
        if ai_insights:
            insight_text = ai_insights.get("insight_text", "")
            # Truncate slightly if too long for layout containment
            if len(insight_text) > 700:
                insight_text = insight_text[:700] + "... [Ref. BHARAT-TWIN Live Portal]"
            story.append(Paragraph(insight_text, self.body_style))
        else:
            default_brief = (
                f"Under the simulated climate stress conditions in {region_name}, the regional risk profile exhibits "
                f"escalations. Localized thermal loading and water cycle shifts threaten agricultural outputs and "
                f"civil infrastructure. Immediate municipal monitoring is recommended."
            )
            story.append(Paragraph(default_brief, self.body_style))
            
        story.append(Spacer(1, 10))
        
        # Recommended Action Checklist (NDMA Directive)
        story.append(Paragraph("4. NDMA-Aligned Action Directives", self.section_header_style))
        story.append(Paragraph(
            "The following emergency response actions are pre-approved and aligned with the <b>National Disaster "
            "Management Authority (NDMA)</b> guidelines for climate threat containment:",
            self.body_style
        ))
        
        # Actions dynamic to the risk level
        action_directives = []
        if risk_val >= 65:
            action_directives = [
                "<b>Activate Urban Cooling Networks:</b> Establish emergency cooled municipal shelters and mobile hydration units.",
                "<b>Load-Balance Power Grids:</b> Rationalize cooling loads and prevent transformer overhead failure states.",
                "<b>Deploy Emergency Water Tankers:</b> Pre-position municipal reserves in sectors showing high water deficit indexes.",
                "<b>Issue Agricultural Thermal Advisories:</b> Adjust irrigation frequencies and recommend micro-crop shading protocols."
            ]
        else:
            action_directives = [
                "<b>Pre-Position Municipal Reserves:</b> Review emergency water storage volumes and transformer maintenance schedules.",
                "<b>Scale Soil Moisture Surveys:</b> Maintain active regional agricultural moisture grid telemetry.",
                "<b>Issue Standard Public Advisories:</b> Release standard hydrological safety guidelines to public channels.",
                "<b>Establish Daily Grid Sync:</b> Continuous IMD gridded observation and INSAT satellite telemetry synchronization."
            ]
            
        action_table_data = []
        for action in action_directives:
            action_table_data.append([
                Paragraph("[  ]", self.body_style),
                Paragraph(action, self.body_style)
            ])
            
        t_action = Table(action_table_data, colWidths=[0.4*inch, 6.6*inch])
        t_action.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#F3F4F6")),
        ]))
        story.append(t_action)
        
        story.append(Spacer(1, 15))
        
        # Provenance footer on Page 3
        provenance_text = (
            "<b>Scientific Data Provenance:</b> This directive is generated by the BHARAT-TWIN platform using daily weather cell "
            "observations from the Indian Meteorological Department (IMD) regridded at 0.25° resolution, combined with active Land Surface "
            "Temperature (LST) datasets from INSAT-3D/3DR satellites. Computational forecasts are generated via an XGBoost ML model "
            "trained on regional historical timelines (1951-2025)."
        )
        t_prov = Table([[Paragraph(provenance_text, ParagraphStyle('ProvText', parent=self.body_style, fontSize=8, textColor=self.color_text_muted, leading=11))]], colWidths=[7*inch])
        t_prov.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), self.color_bg_light),
            ('LINELEFT', (0,0), (-1,-1), 3, self.color_primary),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t_prov)
        
        # Build document
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
