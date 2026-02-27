import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { describe, expect, test, beforeAll } from 'vitest';

const BUILD_DIR = 'build';

describe('production build', () => {
	beforeAll(() => {
		execSync('npm run build', { stdio: 'inherit' });
	});

	test('produces build/ directory', () => {
		expect(existsSync(BUILD_DIR)).toBe(true);
	});

	test('produces index.html', () => {
		expect(existsSync(join(BUILD_DIR, 'index.html'))).toBe(true);
	});

	test('produces play.html or play/index.html', () => {
		const hasPlay =
			existsSync(join(BUILD_DIR, 'play.html')) || existsSync(join(BUILD_DIR, 'play', 'index.html'));
		expect(hasPlay).toBe(true);
	});

	test('produces 404.html fallback', () => {
		expect(existsSync(join(BUILD_DIR, '404.html'))).toBe(true);
	});

	test('produces manifest.webmanifest', () => {
		expect(existsSync(join(BUILD_DIR, 'manifest.webmanifest'))).toBe(true);
	});

	test('manifest has required fields', () => {
		const raw = readFileSync(join(BUILD_DIR, 'manifest.webmanifest'), 'utf8');
		const manifest = JSON.parse(raw);
		expect(manifest.name).toBe('Set');
		expect(manifest.short_name).toBe('Set');
		expect(manifest.start_url).toBe('/set/');
		expect(manifest.display).toBe('standalone');
		expect(manifest.icons.length).toBeGreaterThanOrEqual(4);
	});

	test('produces service-worker.js', () => {
		expect(existsSync(join(BUILD_DIR, 'service-worker.js'))).toBe(true);
	});

	test('produces icon files', () => {
		const icons = [
			'icon-192.png',
			'icon-512.png',
			'icon-maskable-192.png',
			'icon-maskable-512.png'
		];
		for (const icon of icons) {
			expect(existsSync(join(BUILD_DIR, 'icons', icon))).toBe(true);
		}
	});

	test('produces _app/ directory with assets', () => {
		expect(existsSync(join(BUILD_DIR, '_app'))).toBe(true);
	});

	test('index.html contains theme-color meta', () => {
		const html = readFileSync(join(BUILD_DIR, 'index.html'), 'utf8');
		expect(html).toContain('theme-color');
	});

	test('index.html contains icon link', () => {
		const html = readFileSync(join(BUILD_DIR, 'index.html'), 'utf8');
		expect(html).toContain('icon');
	});
});
