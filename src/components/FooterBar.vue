<script setup lang="ts">
const startYear = 2026
const currentYear = new Date().getFullYear()
const yearDisplay = currentYear !== startYear ? `${startYear}–${currentYear}` : String(startYear)
</script>

<template>
    <footer class="footer">
        <p class="footer-copy">
            &copy; {{ yearDisplay }}
            <a href="https://github.com/TroniPM" target="_blank" rel="noopener noreferrer">
                <span class="text-slate-100 text-xs">
                    tablature<span class="text-emerald-400">.io</span>
                </span>
            </a>
        </p>
        <span class="version-badge" title="Versão atual do site">
            <span class="version-dot" />
            v__VERSION__
        </span>
    </footer>
</template>

<style scoped>
.footer {
    --muted: #64748b;
    --text: #f1f5f9;
    --surface: #0f172a;
    --border: #1e293b;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 1.25rem 2rem;
    border-top: 1px solid var(--border);
}

.footer-copy {
    font-size: 0.8rem;
    color: var(--muted);
}

.footer-copy a {
    color: var(--muted);
    text-decoration: none;
    transition: color 0.15s;
}

.footer-copy a:hover {
    color: var(--text);
}

.version-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.22rem 0.75rem;
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.3px;
}

.version-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 5px #22c55e;
    animation: dot-blink 2.5s ease-in-out infinite;
}

@keyframes dot-blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.45;
    }
}
</style>
