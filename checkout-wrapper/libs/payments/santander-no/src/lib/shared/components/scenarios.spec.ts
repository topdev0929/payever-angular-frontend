import { ScenarioEnum, fieldsDTI, fieldsIIR, fieldsSIFO, getVisibleFieldsByScenario } from './scenarios';

describe('getVisibleFieldsByScenario', () => {
  it('should return fields for ScenarioEnum.IIR', () => {
    const result = getVisibleFieldsByScenario(ScenarioEnum.IIR);
    expect(result).toEqual(fieldsIIR);
  });

  it('should return fields for ScenarioEnum.DTI', () => {
    const result = getVisibleFieldsByScenario(ScenarioEnum.DTI);
    expect(result).toEqual(fieldsDTI);
  });

  it('should return fields for ScenarioEnum.SIFO', () => {
    const result = getVisibleFieldsByScenario(ScenarioEnum.SIFO);
    expect(result).toEqual(fieldsSIFO);
  });

  it('should return an empty array for unknown scenarios', () => {
    const result = getVisibleFieldsByScenario('UnknownScenario' as ScenarioEnum);
    expect(result).toEqual([]);
  });
});
