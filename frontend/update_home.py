import sys
content = open('src/screens/Home.jsx').read()

part1 = '        {/* ── Savings Goal ───────────────────────────────────────── */}'
part1_replacement = '''        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:mt-6">
          <div className="lg:col-span-8 space-y-6">
''' + part1
content = content.replace(part1, part1_replacement)

part2 = '        {/* ── Add Job CTA ─────────────────────────────────────────── */}'
part2_replacement = '''          </div>
          <div className="lg:col-span-4 space-y-6">
''' + part2
content = content.replace(part2, part2_replacement)

part3 = '''        </motion.div>
      </div>
    </div>
  );
}'''
part3_replacement = '''        </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}'''
content = content.replace(part3, part3_replacement)

content = content.replace('className="grid grid-cols-2 gap-3"', 'className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3"')

open('src/screens/Home.jsx', 'w').write(content)
