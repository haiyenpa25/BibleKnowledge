import httpx
import json

payload = {
    'query': 'So sánh quan điểm về Sự Công Bình và Đức Tin giữa Sứ đồ Phao-lô trong Rô-ma và Gia-cơ trong Thư tín Gia-cơ'
}
resp = httpx.post('http://localhost:8000/api/rag/agent-research', json=payload, timeout=90.0)
print('STATUS:', resp.status_code)
if resp.status_code == 200:
    data = resp.json()
    print('STEPS:', len(data['steps']))
    for s in data['steps']:
        print(f"  Step {s['step_number']}: {s['title']} ({s['findings_count']} items)")
    print('SCRIPTURES:', len(data['scripture_evidence']))
    print('ENTITIES:', len(data['knowledge_entities']))
    print('LEXICON:', len(data['lexicon_roots']))
    print('CITATIONS:', len(data['citations']))
    print('MATRIX ROWS:', len(data.get('comparative_matrix') or []))
    print('EXECUTIVE SUMMARY PREVIEW:', data['executive_summary'][:160])
else:
    print('ERROR:', resp.text)
