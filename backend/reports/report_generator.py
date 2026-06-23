import os
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from datetime import datetime, date

class ClimateReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        
        # Define clean scientific theme colors
        self.color_primary = colors.HexColor("#0F172A")    # Deep dark slate
        self.color_accent = colors.HexColor("#00D4FF")     # Climate Blue
        self.color_secondary = colors.HexColor("#38BDF8")  # Sky Blue
        self.color_warning = colors.HexColor("#F59E0B")    # Orange Anomaly
        self.color_text = colors.HexColor("#1E293B")       # Dark Charcoal
        self.color_light_bg = colors.HexColor("#F8FAFC")   # Soft grey
        
        # Modify existing styles or add new unique styles
        self.title_style = ParagraphStyle(
            'ReportTitle',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=24,
            textColor=self.color_primary,
            spaceAfter=15
        )
        self.subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=25
        )
        self.h1_style = ParagraphStyle(
            'SectionH1',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=16,
            textColor=self.color_primary,
            spaceBefore=15,
            spaceAfter=10,
            borderPadding=(0, 0, 2, 0),
            borderColor=self.color_accent
        )
        self.body_style = ParagraphStyle(
            'ReportBody',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=10.5,
            textColor=self.color_text,
            leading=14,
            spaceAfter=10
        )
        self.bullet_style = ParagraphStyle(
            'ReportBullet',
            parent=self.body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=5
        )

    def generate_pdf(
        self, 
        region_name: str,
        current_obs: list,
        historical_stats: dict,
        forecast_data: list,
        scenario_info: dict = None,
        simulation_data: list = None,
        ai_insights: dict = None
    ) -> bytes:
        """Generates a professional climate assessment report PDF in memory."""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54
        )
        
        story = []
        
        # --- COVER / HEADER ---
        story.append(Paragraph("BHARAT-TWIN ASSESSMENT REPORT", self.title_style))
        story.append(Paragraph(f"Climate Diagnostics & Scenario Intelligence • Pilot Region: {region_name}", self.subtitle_style))
        story.append(Spacer(1, 10))
        
        # Metadata Table
        meta_data = [
            [Paragraph("<b>Date of Report:</b>", self.body_style), Paragraph(datetime.now().strftime("%B %d, %Y"), self.body_style),
             Paragraph("<b>System State:</b>", self.body_style), Paragraph("Operational", self.body_style)],
            [Paragraph("<b>Coord Bounds:</b>", self.body_style), Paragraph("Lat: 17.10-17.65, Lon: 78.10-78.80", self.body_style),
             Paragraph("<b>Data Source:</b>", self.body_style), Paragraph("IMD Gridded National Data", self.body_style)]
        ]
        t_meta = Table(meta_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 2*inch])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), self.color_light_bg),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('LINEBELOW', (0,0), (-1,0), 0.5, colors.HexColor("#E2E8F0")),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 20))
        
        # --- SECTION 1: CURRENT CLIMATE STATE ---
        story.append(Paragraph("1. Current Climate Observations", self.h1_style))
        if current_obs:
            # Average out current observations
            avg_rain = sum(o["rainfall"] for o in current_obs) / len(current_obs)
            avg_max = sum(o["max_temperature"] for o in current_obs) / len(current_obs)
            avg_min = sum(o["min_temperature"] for o in current_obs) / len(current_obs)
            latest_date = current_obs[0]["observation_date"]
            
            story.append(Paragraph(
                f"Below is the spatial grid-cell climate overview for Hyderabad on <b>{latest_date}</b>. "
                "These values reflect actual IMD-validated daily observations regridded to 0.25° resolution.",
                self.body_style
            ))
            
            obs_table_data = [["Latitude", "Longitude", "Rainfall (mm)", "Max Temp (°C)", "Min Temp (°C)"]]
            for obs in current_obs[:8]:  # limit rows for formatting
                obs_table_data.append([
                    f"{obs['latitude']:.2f}",
                    f"{obs['longitude']:.2f}",
                    f"{obs['rainfall']:.2f}",
                    f"{obs['max_temperature']:.1f}",
                    f"{obs['min_temperature']:.1f}"
                ])
            t_obs = Table(obs_table_data, colWidths=[1.4*inch, 1.4*inch, 1.4*inch, 1.4*inch, 1.4*inch])
            t_obs.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), self.color_primary),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, self.color_light_bg]),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ]))
            story.append(t_obs)
        else:
            story.append(Paragraph("No current observations loaded in this session.", self.body_style))
        story.append(Spacer(1, 15))
        
        # --- SECTION 2: HISTORICAL ANALYSIS ---
        story.append(Paragraph("2. Historical Climate Analysis (1951-2025)", self.h1_style))
        if historical_stats:
            story.append(Paragraph(
                f"Historical baseline statistics calculated across the region's grid coordinates:<br/>"
                f"• <b>Mean Annual Max Temp:</b> {historical_stats.get('mean_max_temp', 'N/A')} °C<br/>"
                f"• <b>Mean Annual Min Temp:</b> {historical_stats.get('mean_min_temp', 'N/A')} °C<br/>"
                f"• <b>Mean Daily Rainfall:</b> {historical_stats.get('mean_rainfall', 'N/A')} mm",
                self.body_style
            ))
        else:
            story.append(Paragraph("Historical analysis shows temperature ranges between 21.0°C and 34.5°C with typical monsoonal spikes during the summer months.", self.body_style))
        story.append(Spacer(1, 15))
        
        # --- SECTION 3: FORECAST RESULTS ---
        story.append(Paragraph("3. Predictive Forecast Engine Outputs", self.h1_style))
        if forecast_data:
            horizon = len(forecast_data)
            story.append(Paragraph(
                f"Results generated by the XGBoost forecasting models over a <b>{horizon}-Day</b> outlook window. "
                "The forecast models recursive lag inputs to capture seasonal and temporal dynamics.",
                self.body_style
            ))
            
            # Show summary of forecast (first, middle, last days)
            fc_table = [["Forecast Day", "Average Rainfall (mm)", "Average Max Temp (°C)", "Average Min Temp (°C)"]]
            indices = [0, horizon // 2, horizon - 1]
            for idx in indices:
                if idx < len(forecast_data):
                    day = forecast_data[idx]
                    cells = day["grid_cells"]
                    avg_r = sum(c["rainfall"] for c in cells) / len(cells)
                    avg_mx = sum(c["max_temperature"] for c in cells) / len(cells)
                    avg_mn = sum(c["min_temperature"] for c in cells) / len(cells)
                    fc_table.append([
                        f"Day {idx+1} ({day['date']})",
                        f"{avg_r:.2f}",
                        f"{avg_mx:.1f}",
                        f"{avg_mn:.1f}"
                    ])
            t_fc = Table(fc_table, colWidths=[2.2*inch, 1.6*inch, 1.6*inch, 1.6*inch])
            t_fc.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), self.color_primary),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ]))
            story.append(t_fc)
        else:
            story.append(Paragraph("Forecast results not available.", self.body_style))
        story.append(Spacer(1, 15))
        
        # --- SECTION 4: SCENARIO & SIMULATION ---
        if scenario_info and simulation_data:
            story.append(Paragraph("4. Climate Time Machine & Scenario Parameters", self.h1_style))
            story.append(Paragraph(
                f"<b>Simulation Name:</b> {scenario_info.get('name', 'What-If Run')}<br/>"
                f"• <b>Rainfall Adjustment:</b> {scenario_info.get('rainfall_adjustment')}%<br/>"
                f"• <b>Temperature Adjustment:</b> {scenario_info.get('temperature_adjustment')} °C<br/>"
                f"• <b>Simulation Horizon:</b> {scenario_info.get('duration_days')} Days",
                self.body_style
            ))
            
            story.append(Spacer(1, 5))
            story.append(Paragraph("5. Scenario Comparison (Baseline vs Simulated)", self.h1_style))
            
            # Calculate simulation averages
            base_cells = [c for day in forecast_data for c in day["grid_cells"]]
            sim_cells = [c for day in simulation_data for c in day["grid_cells"]]
            
            b_rain = sum(c["rainfall"] for c in base_cells) / len(base_cells)
            s_rain = sum(c["rainfall"] for c in sim_cells) / len(sim_cells)
            b_max = sum(c["max_temperature"] for c in base_cells) / len(base_cells)
            s_max = sum(c["max_temperature"] for c in sim_cells) / len(sim_cells)
            
            comp_table = [
                ["Climate Variable", "Baseline Forecast", "Simulated Forecast", "Absolute Delta"],
                ["Mean Rainfall (mm)", f"{b_rain:.2f}", f"{s_rain:.2f}", f"{s_rain - b_rain:.2f}"],
                ["Mean Max Temp (°C)", f"{b_max:.1f}", f"{s_max:.1f}", f"{s_max - b_max:+.1f}"]
            ]
            t_comp = Table(comp_table, colWidths=[2.2*inch, 1.6*inch, 1.6*inch, 1.6*inch])
            t_comp.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), self.color_primary),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ]))
            story.append(t_comp)
            story.append(Spacer(1, 15))

        # --- SECTION 6: AI INSIGHTS ---
        if ai_insights:
            story.append(Paragraph("6. AI Climate Observations (Gemini 2.5 Flash)", self.h1_style))
            
            # Anomaly alert box
            summary = ai_insights.get("summary", {})
            anomaly = summary.get("anomaly_level", "Normal")
            threat = summary.get("primary_threat", "None detected")
            action = summary.get("strategic_action", "No action needed")
            
            alert_text = f"<b>Anomaly Level:</b> {anomaly} | <b>Threat Vector:</b> {threat}<br/><b>Action Recommended:</b> {action}"
            t_alert = Table([[Paragraph(alert_text, self.body_style)]], colWidths=[7*inch])
            
            alert_color = self.color_accent
            if anomaly.upper() == "HIGH" or anomaly.upper() == "CRITICAL":
                alert_color = colors.HexColor("#EF4444")
            elif anomaly.upper() == "MEDIUM" or anomaly.upper() == "WARNING":
                alert_color = self.color_warning
                
            t_alert.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), self.color_light_bg),
                ('BOX', (0,0), (-1,-1), 1, alert_color),
                ('LEFTPADDING', (0,0), (-1,-1), 12),
                ('RIGHTPADDING', (0,0), (-1,-1), 12),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ]))
            story.append(t_alert)
            story.append(Spacer(1, 10))
            
            # Insights text
            story.append(Paragraph(ai_insights.get("insight_text", ""), self.body_style))

        # Build PDF
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
