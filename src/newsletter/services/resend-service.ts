import { Resend } from 'resend';
import { SendNewsletterParams } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export class ResendService {
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn('WARNING: RESEND_API_KEY is not set. Email sending will be mocked.');
    }
    this.resend = new Resend(apiKey || 'mock-key');
    this.defaultFrom = process.env.NEWSLETTER_FROM_EMAIL || 'newsletter@yourdomain.com';
  }

  async send(params: SendNewsletterParams): Promise<{ id?: string; success: boolean }> {
    const { to, subject, html, text, from } = params;

    // If no API key, mock the send
    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [ResendService] Mock send (no API key):');
      console.log(`   From: ${from || this.defaultFrom}`);
      console.log(`   To: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   HTML length: ${html.length} chars`);
      return { success: true };
    }

    try {
      const result = await this.resend.emails.send({
        from: from || this.defaultFrom,
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      });

      if (result.error) {
        console.error('Resend API error:', result.error);
        return { success: false };
      }

      console.log(`✅ Email sent! ID: ${result.data?.id}`);
      return { id: result.data?.id, success: true };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false };
    }
  }

  async sendBatch(params: SendNewsletterParams & { bcc?: string[] }): Promise<{ id?: string; success: boolean }> {
    const { to, bcc, subject, html, text, from } = params;

    if (!process.env.RESEND_API_KEY) {
      console.log('📧 [ResendService] Mock batch send (no API key):');
      console.log(`   From: ${from || this.defaultFrom}`);
      console.log(`   To: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`   BCC count: ${bcc?.length || 0}`);
      console.log(`   Subject: ${subject}`);
      return { success: true };
    }

    try {
      const result = await this.resend.emails.send({
        from: from || this.defaultFrom,
        to,
        bcc,
        subject,
        html,
        text: text || this.htmlToText(html),
      });

      if (result.error) {
        console.error('Resend API error:', result.error);
        return { success: false };
      }

      console.log(`✅ Batch email sent! ID: ${result.data?.id}`);
      return { id: result.data?.id, success: true };
    } catch (error) {
      console.error('Failed to send batch email:', error);
      return { success: false };
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500) + '...';
  }
}
