import { z } from 'zod';

const CiCdProviderEnum = z.enum(['github', 'gitlab', 'azure-devops', 'jenkins']);
const ProjectTypeEnum = z.enum(['freestyle', 'fiori-elements', 'worklist', 'masterdetail']);

const ScaffoldRequestSchema = z.object({
  projectName: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-z][a-z0-9-]*$/, 'projectName must be lowercase kebab-case'),

  namespace: z
    .string()
    .regex(/^[a-z][a-z0-9.]*$/, 'namespace must be dot-separated lowercase segments')
    .min(3),

  projectType: ProjectTypeEnum.default('freestyle'),

  applicationTitle: z.string().min(3).max(128),

  minUI5Version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'minUI5Version must follow semver e.g. 1.120.0')
    .default('1.120.0'),

  gitRepoUrl: z
    .string()
    .url()
    .optional(),

  ciCdProvider: CiCdProviderEnum.optional(),

  enableOdata: z.boolean().default(true),

  odataServiceUrl: z
    .string()
    .url()
    .optional(),

  theme: z
    .enum(['sap_horizon', 'sap_fiori_3', 'sap_belize'])
    .default('sap_horizon'),

  authorName: z.string().min(2).max(64).optional(),
  authorEmail: z.string().email().optional(),
});

function validateScaffoldRequest(body) {
  return ScaffoldRequestSchema.safeParse(body);
}

export { validateScaffoldRequest, ScaffoldRequestSchema };
