import { DisassemblyScenario } from '../domain/entities/disassembly-scenario.entity';

describe('DisassemblyScenario', () => {
  it('should create a scenario', () => {
    const scenario = new DisassemblyScenario({
      name: 'Lego Castle разборка',
      parentProductCode: 'LEGO-CASTLE',
      childProductCodes: ['LEGO-CASTLE-PART1', 'LEGO-CASTLE-PART2', 'LEGO-CASTLE-PART3'],
      partsCount: 3,
      isActive: true,
    });

    expect(scenario.getName()).toBe('Lego Castle разборка');
    expect(scenario.getParentProductCode()).toBe('LEGO-CASTLE');
    expect(scenario.getChildProductCodes()).toHaveLength(3);
    expect(scenario.getPartsCount()).toBe(3);
    expect(scenario.isActive()).toBe(true);
  });

  it('should validate product code', () => {
    const scenario = new DisassemblyScenario({
      name: 'Test',
      parentProductCode: 'PARENT-001',
      childProductCodes: [],
      partsCount: 0,
      isActive: true,
    });

    expect(scenario.validate('PARENT-001')).toBe(true);
    expect(scenario.validate('WRONG')).toBe(false);
  });

  it('should activate/deactivate', () => {
    const scenario = new DisassemblyScenario({
      name: 'Test',
      parentProductCode: 'TEST',
      childProductCodes: [],
      partsCount: 0,
      isActive: false,
    });

    scenario.activate();
    expect(scenario.isActive()).toBe(true);

    scenario.deactivate();
    expect(scenario.isActive()).toBe(false);
  });
});
