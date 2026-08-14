<?php

namespace App\Services\Admin;

use App\Models\File;
use App\Models\Folder;
use App\Models\User;
use Common\Admin\Analytics\Actions\GetAnalyticsHeaderDataAction;
use Common\Database\Metrics\MetricDateRange;
use Common\Database\Metrics\ValueMetric;

class GetAnalyticsHeaderData implements GetAnalyticsHeaderDataAction
{
    public function execute(array $params): array
    {
        $dateRange = new MetricDateRange(
            start: $params['startDate'] ?? null,
            end: $params['endDate'] ?? null,
            timezone: $params['timezone'] ?? null,
        );

        return [
            array_merge(
                [
                    'name' => __('New files'),
                ],
                (new ValueMetric(
                    File::withTrashed(),
                    dateRange: $dateRange,
                ))->count(),
            ),
            array_merge(
                [
                    'name' => __('New folders'),
                ],
                (new ValueMetric(
                    Folder::withTrashed(),
                    dateRange: $dateRange,
                ))->count(),
            ),
            array_merge(
                [
                    'name' => __('New users'),
                ],
                (new ValueMetric(
                    User::query(),
                    dateRange: $dateRange,
                ))->count(),
            ),
            array_merge(
                [
                    'name' => __('Total Space Used'),
                    'type' => 'fileSize',
                ],
                (new ValueMetric(
                    File::query(),
                    dateRange: $dateRange,
                    column: 'file_size',
                ))->sum(),
            ),
        ];
    }
}
